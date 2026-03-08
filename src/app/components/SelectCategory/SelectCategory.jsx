"use client";
import { useEffect, useRef,useState } from "react";
import styles from "./SelectCategory.module.css";
import gsap from "gsap";

const closingAnim = function (content) {
  gsap.to(content, {
    height: 0,
    autoAlpha: 0,
    duration: 0.5,
    ease: "Power4.inOut",
  });
};

const openingAnim = function (content) {
  gsap.to(content, {
    height: "auto",
    autoAlpha: 1,
    duration: 0.5,
    ease: "Power4.inOut",
  });
};


export default function SelectCategory({imgSorce,categoryWord,children}){
    const contentRef = useRef(null);
    const [isOpen,setIsOpen]=useState(false);
    const handleClick=()=>{
    setIsOpen(prev => !prev);
    }
    useEffect(() => {
        if (!contentRef.current) return;
        if (isOpen) {
            openingAnim(contentRef.current);
        } else {
            closingAnim(contentRef.current);
        }
    }, [isOpen]);
    return (
        <>
            <div className={`${styles.SelectCategoryBox} ${isOpen ? styles.active : ""}`}>
                <button type="button" className={` ${styles.SelectCategory} ${isOpen ? styles.active : ""}`} onClick={handleClick}>
                    {imgSorce && 
                    <div className={styles.categoryIconBox}>
                        <img src={imgSorce} alt={categoryWord} className={styles.categoryIcon} />
                    </div>
                    }
                
                    <p className={styles.CategoryTxt}>{categoryWord}</p>
                </button>
                <div 
                    ref={contentRef}
                    className={`${styles.categoryChildren} ${isOpen ? styles.active : ""}`}
                >
                    {children}
                </div>
            </div>
            
        </>
    );
}

// 遷移する機構は未実装
// 押しているもの以外にもbox-shadowを適用