"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "@/app/components/Header/Header";
import styles from "./page.module.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface MerchandiseItem {
  id: string;
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
  const [isFavorited, setIsFavorited] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    const supabase = createClient();

    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("merchandises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("fetchItem エラー:", error.message, error.code, error.details);
      } else {
        setItem(data);
      }
    };

    const fetchUserAndFavorite = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("favorites")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("merchandise_id", id)
        .maybeSingle();

      setIsFavorited(!!data);
    };

    if (id) {
      fetchItem();
      fetchUserAndFavorite();
    }
  }, [id]);

  const toggleFavorite = async () => {
    if (!userId || !item) return;
    const supabase = createClient();

    if (isFavorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("merchandise_id", item.id);
      setIsFavorited(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: userId, merchandise_id: item.id });
      setIsFavorited(true);
    }
  };

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
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{item.name}</h1>
            {userId && (
              <button
                className={styles.favoriteBtn}
                onClick={toggleFavorite}
                aria-label={isFavorited ? "お気に入り解除" : "お気に入り登録"}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill={isFavorited ? "#e63946" : "none"} stroke={isFavorited ? "#e63946" : "#bbb"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            )}
          </div>
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
