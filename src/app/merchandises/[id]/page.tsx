"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "@/app/components/Header/Header";
import styles from "./page.module.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface MerchandiseItem {
  id: number;
  name: string;
  price: number;
  state: string;
  image_url: string[];
  description: string;
}

export default function MerchandiseDetail() {
  const PageTitle ="購入する";
  const ImgSrc="/cart.png";
  const [item, setItem] = useState<MerchandiseItem | null>(null);
  const params = useParams();
  const id = params.id; // フォルダ名の [id] がここに入ってくる！
  const router  = useRouter();
  const searchParams = useSearchParams();
  // 外部サイトへ飛ばされないよう、自サイト内のパスだけを許可する（オープンリダイレクト対策）。
  // "//evil.com" や "/\evil.com" はブラウザが外部URLとして解釈するので弾く
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo =
    rawReturnTo && /^\/(?![\/\\])/.test(rawReturnTo) ? rawReturnTo : "/purchase";

  useEffect(() => {
    const fetchItem = async () => {
      const supabase = createClient();

      // IDを使って、その商品1つだけを取得する
      const { data, error } = await supabase
        .from("merchandises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("エラー:", error);
      } else {
        setItem(data);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  if (!item) return <div>読み込み中... (ID: {id})</div>;
  return (
    <>
      <Header pageTitle={PageTitle} imgSrc={ImgSrc}/>
      <main>
        <h1>商品名: {item.name}</h1>
        <p>価格：{item.price}円</p>
        <p>状態：{item.state}</p>
        <div>
          <img src={item.image_url[0]} alt={item.description} width="200px" height="200px"/>
        </div>
        <p>商品説明：{item.description}</p>
        <button onClick={() => router.push(returnTo)}>戻る</button>
      </main>
    </>
  );
}
