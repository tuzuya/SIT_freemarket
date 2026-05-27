"use client";
import { useState } from "react";
import { supabase } from "../../utils/supabase";
import styles from "./SellForm.module.css";

const SUBJECT_MAP: Record<string, number> = {
    "数学": 1,
    "情報": 2,
    "化学": 3,
    "物理": 4,
    "生物": 5,
    "英語": 6,
    "その他": 7,
}

const STATE_MAP: Record<string, number> = {
    "新品未使用": 1,
    "やや傷・汚れあり": 2,
    "未使用に近い": 3,
    "傷・汚れあり": 4,
    "目立った傷・汚れなし": 5,
    "書き込みあり": 6,
}

const DELIVERYMETHOD_MAP: Record<string, number> = {
    "豊洲キャンパス": 1,
    "大宮キャンパス": 2,
    "郵送": 3,
}

const COURSE_MAP: Record<string, number> = {
    "機械工学課程基幹機械コース": 1,
    "機械工学課程先進機械コース": 2,
    "物質化学課程環境・物質コース": 3,
    "物質化学課程化学・生命工学コース": 4,
    "電気電子工学課程電気・ロボット工学コース": 5,
    "電気電子工学課程先端電子工学コース": 6,
    "情報・通信工学課程情報通信コース": 7,
    "情報・通信工学課程情報工学コース": 8,
    "土木工学課程都市・環境コース": 9,
    "先進国際課程": 10,
    "電気情報システム学科": 11,
    "機械制御システム学科": 12,
    "環境システム学科": 13,
    "生命科学科ー生命科学コース": 14,
    "生命科学科ー生命医工学コース": 15,
    "数理科学科": 16,
    "社会情報システムコース": 17,
    "UXコース": 18,
    "プロダクトコース": 19,
    "SAコース": 20,
    "UAコース": 21,
    "APコース": 22,
    "教職": 23
}

const SEMESTER_MAP: Record<string, number> = {
    "1年春学期": 1,
    "1年秋学期": 2,
    "2年春学期": 3,
    "2年秋学期": 4,
    "3年春学期": 5,
    "3年秋学期": 6,
    "4年春学期": 7,
    "4年秋学期": 8,
}

interface ImageItem {
    file: File;
    previewUrl: string;
}

export default function SellForm(){
    const [ bookName, setBookName] = useState("");
    // const [ imageFile, setImageFile ] = useState(null);
    const [ images, setImages ] = useState<ImageItem[]>([]);
    const [ price, setPrice] = useState("");
    const [ bookSubject, setBookSubject ] = useState("数学");
    const [ bookState, setBookState ] = useState("新品未使用");
    const [ deliveryMethod, setDeliveryMethod ] = useState("豊洲キャンパス");
    const [ description, setDescription ] = useState("");
    const [ course, setCourse ] = useState("機械工学課程基幹機械コース");
    const [ semester, setSemester ] = useState("1年春学期");

    const [ loading, setLoading ] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 変更前: const files = Array.from(e.target.files);
        // 変更後: nullチェックを追加
        // 理由: TypeScriptではe.target.filesがnullになりうるため
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        if(files.length === 0) return;

        if(images.length + files.length > 5){
            alert("画像は最大5枚までです");
            return;
        }

        //プレビュー用URLを作ってStateに追加
        const newImages = files.map((file) => {
            const url = URL.createObjectURL(file);
            console.log("生成されたURL:", url);
            return {
                file: file,
                previewUrl: url
            };
        });
        setImages((prev) => [...prev, ...newImages]);

        //同じファイルを再選択できるようにinputの値をクリア
        // 変更前: e.target.value = null;
        // 変更後: e.target.value = "";
        // 理由: TypeScriptではstring型のプロパティにnullは代入できないため
        e.target.value = "";

        console.log("現在の画像リスト:", images);
    };

    const removeImage = (indexToRemove: number) => {
        setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try{
            //ログインチェック＆画像チェック
            const { data: { user } } = await supabase.auth.getUser();
            if(!user) throw new Error("ログインしていません");
            if(images.length === 0) throw new Error("画像が選択されていません");

            //supabaseのidを使う項目については、stateで管理しているものから変換する
            const subjectId = SUBJECT_MAP[bookSubject];
            const stateId = STATE_MAP[bookState];
            const deliveryMethodId = DELIVERYMETHOD_MAP[deliveryMethod];
            const courseId = COURSE_MAP[course];
            const semesterId = SEMESTER_MAP[semester];

            if(!subjectId) throw new Error(`科目IDが見つかりません: ${bookSubject}`);
            if(!stateId) throw new Error(`状態IDが見つかりません: ${bookState}`);
            if(!deliveryMethodId) throw new Error(`受け渡し方法IDが見つかりません: ${deliveryMethod}`);
            if(!courseId) throw new Error(`コースIDが見つかりません: ${course}`);
            if(!semesterId) throw new Error(`学期IDが見つかりません: ${semester}`);

            const uploadPromises = images.map(async(img) => {
                const fileExt = img.file.name.split(".").pop();
                const fileName = `${Math.random().toString(32).substring(2)}.${fileExt}`;

                //画像アップロード
                const { error: uploadError } = await supabase
                    .storage
                    .from("images")
                    .upload(fileName, img.file);
                if(uploadError) throw uploadError;

                //URL取得
                const { data: urlData } = supabase
                    .storage
                    .from("images")
                    .getPublicUrl(fileName);

                return urlData.publicUrl;
            })

            const uploadUrls = await Promise.all(uploadPromises);

            const insertData = {
                title: bookName,
                price: Number(price),
                image_url: uploadUrls,
                seller_id: user.id,
                description: description,
                subject_id: subjectId,
                state_id: stateId,
                delivery_method_id: deliveryMethodId,
                course_id: courseId,
                semester_id: semesterId
            };
            console.log("【送信データ確認】", insertData);

            const { error: insertError } = await supabase
                .from("merchandises")
                .insert({
                    name: bookName,
                    image_url: uploadUrls,
                    seller_id: user.id,
                    price: Number(price),
                    description: description,

                    subject_id: subjectId,
                    state_id: stateId,
                    deliveryMethod_id: deliveryMethodId,
                    course_id: courseId,
                    semester_id: semesterId
                })

            //出品完了後の処理
            alert("出品が完了しました！");

            //入力欄の初期化
            setBookName("");
            setPrice("");
            setImages([]); // 画像データの実体を消す
            setDescription("");

            // 選択肢も初期値に戻す（初期値を変えている場合はそれに合わせてください）
            setBookSubject("数学");
            setCourse("機械工学課程基幹機械コース");
            setSemester("1年春学期");
            setBookState("新品未使用");
            setDeliveryMethod("豊洲キャンパス");

            // 3. 【重要】画像選択欄の見た目をクリアする
            // file inputはstateだけでは見た目が消えないため、直接クリアします
            const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
            if(fileInput) {
                fileInput.value = "";
            }
        }
        catch(error){
            console.error(error)
            // 変更前: alert("エラー: " + error.message);
            // 変更後: instanceofでErrorかどうか確認してからmessageを参照
            // 理由: TypeScriptではcatchのerrorがunknown型なので、直接.messageにアクセスできないため
            if(error instanceof Error){
                alert("エラー: " + error.message);
            }
        }
        finally{
            setLoading(false);
        }

    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                {/* 画像 */}
                <div className={styles.formGroup}>
                    <label className={styles.label}></label>
                    <div className={styles.imageScrollContainer}>
                        {/*選択済みの画像プレビューを表示 */}
                        {images.map((img, index) => (
                            <div key={index} className={styles.imagePreviewBox}>
                                <img
                                    src={img.previewUrl}
                                    alt="preview"
                                    className={styles.previewImage}
                                />
                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => removeImage(index)}
                                >
                                    ✖
                                </button>
                            </div>
                        ))}

                        {/*「＋」ボタン（５枚未満の時だけ表示） */}
                        {images.length < 5 && (
                            <label className={styles.uploadBox}>
                                <span>+</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple //複数選択を許可
                                    className={styles.hiddenInput}
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* 商品名 */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>商品名</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={bookName}
                        onChange={(e) => setBookName(e.target.value)}
                        required
                        placeholder="教科書名など"
                    />
                </div>

                {/* 科目 (Subject) */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>科目名</label>
                    <select
                        className={styles.select}
                        value={bookSubject}
                        onChange={(e) => setBookSubject(e.target.value)}
                    >
                        {Object.keys(SUBJECT_MAP).map((key) => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                </div>

                {/* 価格 */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>希望価格 (円)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        placeholder="1000"
                    />
                </div>

                {/* 状態 (State) */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>状態</label>
                    <div className={styles.radioGroup}>
                        {Object.keys(STATE_MAP).map((key) => (
                            <label key={key} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="bookState" //グループ化のために必須
                                    className={styles.radioInput}
                                    value={key}
                                    checked={bookState === key}
                                    onChange={(e) => setBookState(e.target.value)}
                                />
                                {key}
                            </label>
                        ))}
                    </div>
                </div>

                {/*コース*/}
                <div className={styles.formGroup}>
                    <label className={styles.label}>使用したコース</label>
                    <select
                        className={styles.select}
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                    >
                        {Object.keys(COURSE_MAP).map((key) => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                </div>

                {/*学期*/}
                <div className={styles.formGroup}>
                    <label className={styles.label}>使用した学期</label>
                    <div className={styles.radioGroup}>
                        {Object.keys(SEMESTER_MAP).map((key) => (
                            <label key={key} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="semester" //グループ化のために必須
                                    className={styles.radioInput}
                                    value={key}
                                    checked={semester === key}
                                    onChange={(e) => setSemester(e.target.value)}
                                />
                                {key}
                            </label>
                        ))}
                    </div>
                </div>

                {/* 受渡方法 (Delivery) */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>受け渡し方法</label>
                    <div className={styles.radioGroup}>
                        {Object.keys(DELIVERYMETHOD_MAP).map((key) => (
                            <label key={key} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="deliveryMethod" //グループ化のために必須
                                    className={styles.radioInput}
                                    value={key}
                                    checked={deliveryMethod === key}
                                    onChange={(e) => setDeliveryMethod(e.target.value)}
                                />
                                {key}
                            </label>
                        ))}
                    </div>
                </div>

                {/* 説明 (Description) */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>商品説明 (自由記述)</label>
                    <textarea
                        className={styles.textarea}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        placeholder="その他、特記事項があればここに書いてください"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={loading}
                >
                    {loading ? "送信中..." : "出品する"}
                </button>
            </form>
        </div>
    );
}
