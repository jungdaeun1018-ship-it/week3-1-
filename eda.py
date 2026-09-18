"""
Pima Indians Diabetes 데이터 기초 EDA
결측치 / 중복값 / 이상치 확인 및 시각화
"""

import os
import kagglehub
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


def load_data():
    path = kagglehub.dataset_download("kumargh/pimaindiansdiabetescsv")
    csv_file = [f for f in os.listdir(path) if f.endswith(".csv")][0]
    csv_path = os.path.join(path, csv_file)

    columns = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
               "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"]

    return pd.read_csv(csv_path, header=None, names=columns)


def check_missing(df, zero_as_missing_cols):
    print("=== NaN 개수 ===")
    print(df.isnull().sum())

    plt.figure(figsize=(10, 5))
    sns.heatmap(df.isnull(), cbar=False, cmap="viridis")
    plt.title("Missing Value Heatmap")
    plt.show()

    print("\n=== 0 값 개수 (실질적 결측치로 의심되는 값) ===")
    zero_counts = (df[zero_as_missing_cols] == 0).sum()
    print(zero_counts)

    zero_counts.plot(kind="bar", figsize=(8, 5), color="orange")
    plt.title("Count of Zero Values (Suspected Missing Data)")
    plt.ylabel("Count")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()


def check_duplicates(df):
    dup_count = df.duplicated().sum()
    print(f"중복된 행 개수: {dup_count}")
    if dup_count > 0:
        print(df[df.duplicated()])


def check_outliers(df, feature_cols):
    plt.figure(figsize=(15, 8))
    for i, col in enumerate(feature_cols):
        plt.subplot(2, 4, i + 1)
        sns.boxplot(y=df[col])
        plt.title(col)
    plt.tight_layout()
    plt.show()

    print("=== IQR 기준 이상치 개수 ===")
    for col in feature_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        outliers = df[(df[col] < lower) | (df[col] > upper)]
        print(f"{col}: {len(outliers)}개 (범위: {lower:.2f} ~ {upper:.2f})")


def main():
    df = load_data()
    print(df.shape)
    print(df.head())

    feature_cols = [c for c in df.columns if c != "Outcome"]
    zero_as_missing_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]

    check_missing(df, zero_as_missing_cols)
    check_duplicates(df)
    check_outliers(df, feature_cols)


if __name__ == "__main__":
    main()
