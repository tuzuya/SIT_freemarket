"use client";
import styles from "./radioBtns.module.css";
import { RadioItem } from "../data/arrays";

interface RadioBtnsProps {
    items: RadioItem[];
    name: string;
    selectedValue?: string;
    onChange?: (value: string) => void;
}

export default function RadioBtns({ items, name, selectedValue = "", onChange }: RadioBtnsProps) {
  if (!items || !Array.isArray(items)) return null;

  return (
    <div className={styles.radioForm}>
      <dl>
        {items.map((item) => {
          const inputId = `${name}-${item.id}`;
          return (
            //ddタグは、その項目の説明なので、keyとしてinputIdを使うことでほかのラジオボタンと区別できるようにする
            <dd key={inputId} className={styles.radioDd}>
              <input
                type="radio"
                id={inputId}
                name={name}
                value={item.forSearch}
                checked={String(selectedValue) === String(item.forSearch)}
                onChange={(e) => onChange?.(e.target.value)}
              />
              <label htmlFor={inputId} className={styles.radioLabel}>
                {item.label}
              </label>
            </dd>
          );
        })}
      </dl>
    </div>
  );
}
