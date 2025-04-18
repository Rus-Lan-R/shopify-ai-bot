import React from "react";
import styles from "./styles.module.css";

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 80,
  strokeWidth = 8,
  progress,
  color = "var(--p-color-bg-fill-info-active)",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        <circle
          className={styles.background}
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={styles.progress}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className={styles.label}>{Math.round(progress)}%</div>
    </div>
  );
};
