"use client";

export interface RadioItem {
    id: number;
    label: string;
    forSearch: number;
}

export interface CategoryChild {
    id: number;
    label: string;
    img: string;
    items: RadioItem[];
}

export interface CategoryOption {
    id: number;
    label: string;
    children: CategoryChild[];
    items?: RadioItem[];
}

export interface NameItem {
    id: number;
    label: string;
}

export const options: CategoryOption[] = [
    {
        id: 1,
        label: "学部・学科",
        children: [
            {
                id: 11, label: "工学部", img: "/enginerring.png",
                items: [
                    { id: 111, label: "機械工学課程基幹機械コース", forSearch: 1 },
                    { id: 112, label: "機械工学課程先進機械コース", forSearch: 2 },
                    { id: 113, label: "物質化学課程環境・物質コース", forSearch: 3 },
                    { id: 114, label: "物質化学課程化学・生命工学コース", forSearch: 4 },
                    { id: 115, label: "電気電子工学課程電気・ロボット工学コース", forSearch: 5 },
                    { id: 116, label: "電気電子工学課程先端電子工学コース", forSearch: 6 },
                    { id: 117, label: "情報・通信工学課程情報通信コース", forSearch: 7 },
                    { id: 118, label: "情報・通信工学課程情報工学コース", forSearch: 8 },
                    { id: 119, label: "土木工学課程都市・環境コース", forSearch: 9 },
                    { id: 1111, label: "先進国際課程", forSearch: 10 },
                ]
            },
            {
                id: 12, label: "システム理工学部", img: "/enginerring.png",
                items: [
                    { id: 121, label: "電気情報システム学科", forSearch: 11 },
                    { id: 122, label: "機械制御システム学科", forSearch: 12 },
                    { id: 123, label: "環境システム学科", forSearch: 13 },
                    { id: 124, label: "生命科学科ー生命科学コース", forSearch: 14 },
                    { id: 125, label: "生命科学科ー生命医工学コース", forSearch: 15 },
                    { id: 126, label: "数理科学科", forSearch: 16 },
                ]
            },
            {
                id: 13, label: "デザイン工学部", img: "/enginerring.png",
                items: [
                    { id: 131, label: "社会情報システムコース", forSearch: 17 },
                    { id: 132, label: "UXコース", forSearch: 18 },
                    { id: 133, label: "プロダクトコース", forSearch: 19 }
                ]
            },
            {
                id: 14, label: "建築学部", img: "/enginerring.png",
                items: [
                    { id: 141, label: "SAコース", forSearch: 20 },
                    { id: 142, label: "UAコース", forSearch: 21 },
                    { id: 143, label: "APコース", forSearch: 22 }
                ]
            },
            {
                id: 15, label: "教職", img: "/enginerring.png",
                items: [
                    { id: 151, label: "教職", forSearch: 23 }
                ]
            },
        ]
    },
    {
        id: 2,
        label: "学年・学期",
        children: [
            {
                id: 21, label: "春学期", img: "/enginerring.png",
                items: [
                    { id: 211, label: "１年", forSearch: 1 },
                    { id: 212, label: "２年", forSearch: 2 },
                    { id: 213, label: "３年", forSearch: 3 },
                    { id: 214, label: "４年", forSearch: 4 },
                ]
            },
            {
                id: 22, label: "秋学期", img: "/enginerring.png",
                items: [
                    { id: 221, label: "１年", forSearch: 5 },
                    { id: 222, label: "２年", forSearch: 6 },
                    { id: 223, label: "３年", forSearch: 7 },
                    { id: 224, label: "４年", forSearch: 8 },
                ]
            },
        ]
    },
    {
        id: 3,
        label: "科目",
        children: [],
        items: [
            { id: 31, label: "数学", forSearch: 1 },
            { id: 32, label: "情報", forSearch: 2 },
            { id: 33, label: "化学", forSearch: 3 },
            { id: 34, label: "物理", forSearch: 4 },
            { id: 35, label: "生物", forSearch: 5 },
            { id: 36, label: "英語", forSearch: 6 },
            { id: 37, label: "その他", forSearch: 7 }
        ]
    }
];

export const getName: NameItem[] = [
    { id: 1, label: "機械工学課程基幹機械コース" },
    { id: 2, label: "機械工学課程先進機械コース" },
    { id: 3, label: "物質化学課程環境・物質コース" },
    { id: 4, label: "物質化学課程化学・生命工学コース" },
    { id: 5, label: "電気電子工学課程電気・ロボット工学コース" },
    { id: 6, label: "電気電子工学課程先端電子工学コース" },
    { id: 7, label: "情報・通信工学課程情報通信コース" },
    { id: 8, label: "情報・通信工学課程情報工学コース" },
    { id: 9, label: "土木工学課程都市・環境コース" },
    { id: 10, label: "先進国際課程" },
    { id: 11, label: "電気情報システム学科" },
    { id: 12, label: "機械制御システム学科" },
    { id: 13, label: "環境システム学科" },
    { id: 14, label: "生命科学科ー生命科学コース" },
    { id: 15, label: "生命科学科ー生命医工学コース" },
    { id: 16, label: "数理科学科" },
    { id: 17, label: "社会情報システムコース" },
    { id: 18, label: "UXコース" },
    { id: 19, label: "プロダクトコース" },
    { id: 20, label: "SAコース" },
    { id: 21, label: "UAコース" },
    { id: 22, label: "APコース" },
    { id: 23, label: "教職" }
];

export const getPeriod: NameItem[] = [
    { id: 1, label: "１年春" },
    { id: 2, label: "２年春" },
    { id: 3, label: "３年春" },
    { id: 4, label: "４年春" },
    { id: 5, label: "１年秋" },
    { id: 6, label: "２年秋" },
    { id: 7, label: "３年秋" },
    { id: 8, label: "４年秋" },
];

export const getSubject: NameItem[] = [
    { id: 1, label: "数学" },
    { id: 2, label: "情報" },
    { id: 3, label: "化学" },
    { id: 4, label: "物理" },
    { id: 5, label: "生物" },
    { id: 6, label: "英語" },
    { id: 7, label: "その他" }
];
