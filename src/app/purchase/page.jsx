"use client";
import CheckKeyword from "../components/CheckKeyWord/CheckKeyword";
import { options } from "../components/data/arrays";
import Header from "../components/Header/Header";
import RadioBtns from "../components/radioBtns/radioBtns";
import SendBtn from "../components/SendBtn/SendBtn";
import SelectCategory from "../components/SelectCategory/SelectCategory";
import UserLog from "../components/UserLog/UserLog";
import { createClient } from "@/utils/supabase/client";
import { getName, getPeriod, getSubject } from "../components/data/arrays";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function PurchasePage(){
    const PageTitle ="購入する";
    const ImgSrc="/cart.png";
    const router=useRouter();
    const pathname = usePathname();

    //useSearchParamsは、自動でURLクエリの？以降の部分を読み取って反映させてくれる。
    const searchParams = useSearchParams();
    const returnToParams = new URLSearchParams(searchParams.toString());
    returnToParams.delete("autoOpen");
    const returnToQuery = returnToParams.toString();
    const returnTo = returnToQuery ? `${pathname}?${returnToQuery}` : pathname;

    // 検索結果を受け取る箱
    const[searchResults, setSearchResults]= useState([]);

    // 検索画面と商品選択画面の切り替え

    const[showResults, setShowResults]=useState(false);

    const [searchConditions, setSearchConditions] = useState({
    keyword: "",
    group0: "",
    group1: "",
    group2: ""
    });

    // supabeseからデータを取る＊asyncで時間のかかる作業を宣言し、awaitでポーズ
    const handleSubmit= async (e) =>{
        e.preventDefault();
        //ここのFormDataは、選択ウィンドウ全体についているので、その中のすべてのラジオボタンの選択情報を取得できる
        const formData = new FormData(e.currentTarget);
        const keyword = formData.get("key-word") || ""; // CheckKeywordのname
        const group0 = formData.get("group-0") || "";   // 1つ目のアコーディオン
        const group1 = formData.get("group-1") || "";   // 2つ目のアコーディオン
        const group2 = formData.get("group-2") || "";   // 3つ目のアコーディオン

        //URLクエリの作成 -> のちのDBクエリとは別なので注意！！
        const nextParams = new URLSearchParams();
        if (keyword) nextParams.set("keyword", keyword);
        if (group0) nextParams.set("group0", group0);
        if (group1) nextParams.set("group1", group1);
        if (group2) nextParams.set("group2", group2);
        //商品ページから戻るボタンを押したときの無限ループの防止用のフラグをparamsにセットする
        nextParams.set("autoOpen", "1");
        router.push(`${pathname}?${nextParams.toString()}`);

        setSearchConditions({ keyword, group0, group1, group2 });
        console.log("検索条件：",{keyword,group0,group1,group2});

        // query制作
        // let query=supabase.from('merchandises').select('*');
        // if(keyword){
        //     query=query.ilike('name',`%${keyword}%`);
        // }
        // if (group0) {
        //     // ★【重要】'category' を1つ目のカラム名に変えてください
        //     query = query.eq('course_id', group0);
        // }

        // // カテゴリ2の絞り込み（必要ならコメントアウトを外して設定）
        // if (group1) {
        //     query = query.eq('semester_id', group1);
        // }

        // if (group2) {
        //     query = query.eq('subject_id', group2);
        // }

        // const {data,error} = await query;
        // if(error){
        //    console.error("エラーだ！:", error);
        //     alert("データの取得に失敗しました"); 
        // }else{
        //     console.log("取れたデータ：",data);
        //     if(data.length === 0){
        //         alert("条件に合う商品はありませんでした。");
        //     }else if(data.length===1){
        //         // そのまま商品ページに遷移
        //         const targetId=data[0].id;
        //         console.log(`ID: ${targetId} のページへ飛びます`);
        //         router.push(`/merchandises/${targetId}`);
        //     }else {
        //         setSearchResults(data);
        //         setShowResults(true);
        //     }
        // }

    };

    useEffect(()=> {
        const runSearch = async() => {
            const keyword = searchParams.get("keyword") || "";
            const group0 = searchParams.get("group0") || "";
            const group1 = searchParams.get("group1") || "";
            const group2 = searchParams.get("group2") || "";
            const autoOpen = searchParams.get("autoOpen") === "1";

            const supabase=createClient();

            //クエリが空なら検索画面表示
            if(!keyword && !group0 && !group1 && !group2){
                setShowResults(false);
                setSearchResults([]);
                setSearchConditions({ keyword: "", group0: "", group1: "", group2: "" });
                return;
            }

            setSearchConditions({ keyword, group0, group1, group2 });

            //DBクエリの作成
            let query=supabase.from('merchandises').select('*');
            if(keyword) query = query.ilike("name", `%${keyword}%`);
            if(group0) query = query.eq("course_id", group0);
            if(group1) query = query.eq("semester_id", group1);
            if(group2) query = query.eq("subject_id", group2);

            const {data,error} = await query;
            
            if(error){
                alert("データの取得に失敗しました");
                return;
            }

            //Todo: 検索ヒットが１つの場合に、戻るボタンを押すと商品ページでループするのでその修正
            if(data.length === 0){
                alert("条件に合う商品はありませんでした。");
                setShowResults(false);
                setSearchResults([]);
            }else if(data.length === 1) {
                if(autoOpen){
                    router.push(`/merchandises/${data[0].id}?returnTo=${encodeURIComponent(returnTo)}`);
                }else{
                }
                
            }else{
                setSearchResults(data);
                setShowResults(true);
            }
        }

        runSearch();
    }, [searchParams, pathname, router, returnTo]);

    const handleBackToSearch = () => {
        setShowResults(false);
        setSearchResults([]); // 前の結果をクリア（お好みで）
    };

    const determineName =(group,id)=>{
        let searchOption=[];
        if (!id) return "未選択"; // IDがない場合はすぐ返す
        switch(Number(group)){
            case 0:
                {
                    searchOption=getName;
                    break;
                } 
            case 1:
                {
                    searchOption=getPeriod;
                    break;
                } 
            case 2:
                {
                    searchOption=getSubject;
                    break;
                } 
        }
        const match = searchOption.find((item) => item.id == id);    
        return match ? match.label : "不明な項目"; // 見つかればラベル、なければ代わりの文字
    }
    return (
        <>
        <div className={styles.headerWrraper}>
            <Header pageTitle={PageTitle} imgSrc={ImgSrc}/>
        </div>
        {!showResults ? (
            <main>
            <UserLog/>
            <form onSubmit={handleSubmit}>
            <div className={styles.CheckKeyword}>
                <CheckKeyword
                    value={searchConditions.keyword}
                    onChange={(value) => setSearchConditions({...searchConditions, keyword: value})}
                />
            </div>
                <div className={styles.SelectCategorys}>
                    {options.map((option,index) => (
                        <SelectCategory key={option.id} categoryWord={option.label}>
                            {option.children && option.children.length>0 ? (
                                option.children.map((child)=>(
                                <SelectCategory key={child.id} categoryWord={child.label} imgSource={child.img}>
                                    <RadioBtns 
                                        items={child.items}
                                        name={`group-${index}`}
                                        //searchConditionsオブジェクト内の、group(index)という値に対応したキーを取ってきている。
                                        //配列の中のある値が入ったインデックスを取ってきてる感じ  
                                        selectedValue={searchConditions[`group${index}`]}
                                        onChange={(value) => setSearchConditions((prev) => ({...prev, [`group${index}`]: value}))}
                                    />
                                </SelectCategory>
                            ))
                            ):(
                                <RadioBtns
                                    items={option.items}
                                    name={`group-${index}`}
                                    selectedValue={searchConditions[`group${index}`]}
                                    onChange={(value) => setSearchConditions((prev) => ({...prev, [`group${index}`]: value}))}
                                />
                            )}
                        </SelectCategory>
                    ))}
                </div>
                <div className={styles.sendBtn}><SendBtn/></div>
            </form>
        </main>
        ):(
            <main>
                <div className={styles.searchWords}>
                    <h2 className={styles.searchTitle}>検索ワード</h2>
                    <div className={styles.searchElemnts}>
                        <p className={styles.searchWord}>キーワード：{searchConditions.keyword || "未選択"}</p>
                        <p className={styles.searchWord}>学科：{determineName(0,searchConditions.group0)}</p>
                        <p className={styles.searchWord}>学期：{determineName(1,searchConditions.group1)}</p>
                        <p className={styles.searchWord}>科目：{determineName(2,searchConditions.group2)}</p>
                    </div>
                </div>

                <div className={styles.resultsContainer}>
                    <h3 className={styles.resultTitle}>検索結果</h3>
                {searchResults.map((item)=>(
                    <div 
                        key={item.id}
                        className={styles.searchItem}
                        onClick={()=>router.push(`/merchandises/${item.id}?returnTo=${encodeURIComponent(returnTo)}`)}>
                        <div className={styles.itemImg}>
                            <img 
                                src={item.image_url ? item.image_url[0] : "/no-image.png"}
                                alt={item.image_url ? item.name : "写真はありません"}
                            />
                        </div>
                        <div className={styles.itemInfo}>
                            <h3 className={styles.itemName}>{item.name}</h3>
                            <p className={styles.itemPrice}>￥{item.price}</p>
                        </div>
                    </div>
                ))}
                </div>
                <button className={styles.backButton} onClick={handleBackToSearch}>検索に戻る</button>
            </main>
        )}
        
        </>
    );
}


