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
  const PageTitle = "商品詳細";
  const ImgSrc = "/cart.png";
  const [item, setItem] = useState<MerchandiseItem | null>(null);
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    const fetchItem = async () => {
      const supabase = createClient();
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

  if (!item) {
    return (
      <>
        <div className={styles.headerWrapper}>
          <Header pageTitle={PageTitle} imgSrc={ImgSrc} />
        </div>
        <p className={styles.loading}>読み込み中...</p>
      </>
    );
  }

  return (
    <>
      <div className={styles.headerWrapper}>
        <Header pageTitle={PageTitle} imgSrc={ImgSrc} />
      </div>
      <main className={styles.main}>
        <div className={styles.imageContainer}>
          <img
            src={item.image_url?.[0] ?? "/no-image.png"}
            alt={item.name}
          />
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.name}>{item.name}</h1>
          <p className={styles.price}>¥{item.price.toLocaleString()}</p>
          <span className={styles.stateBadge}>状態：{item.state}</span>
        </div>

        <hr className={styles.divider} />

        <div className={styles.descriptionSection}>
          <p className={styles.descriptionLabel}>商品説明</p>
          <p className={styles.description}>{item.description}</p>
        </div>

        <button className={styles.backButton} onClick={() => router.push(returnTo ?? "/")}>
          戻る
        </button>
      </main>
    </>
  );
}
