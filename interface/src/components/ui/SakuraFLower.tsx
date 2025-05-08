"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/auth/auth.module.css";

export default function SakuraFlower() {
  const [petals, setPetals] = useState<
    { left: string; animationDuration: string }[]
  >([]);

  useEffect(() => {
    const generatedPetals = Array.from({ length: 10 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 5}s`,
    }));
    setPetals(generatedPetals);
  }, []);

  return (
    <>
      {petals.map((petal, i) => (
        <div
          key={i}
          className={styles.sakuraPetal}
          style={{
            left: petal.left,
            animationDuration: petal.animationDuration,
          }}
        />
      ))}
    </>
  );
}
