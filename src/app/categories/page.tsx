import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { categoriesService } from "@/services/categories-service";
import { urlWithParams } from "@/utils/url";
import { ServerComponentProps } from "@/types";
import { Categories } from "@/components/Categories";

const CATEGORY_KEY = "user_categories";
const DEFAULT_CATEGORIES = [
    'Развлечения',
    'Транспорт',
    'Продукты',
    'Доставка еды',
    'Товары для дома',
    'Техника',
    'Подарки',
    'Внутренний перевод',
    'Выпивка',
    'Табак',
    'Ресторан',
    'Кофе',
    'Спорт',
    'Здоровье',
    'Другое',
];

function validateCategory(name: string) {
    // At least 3 words, only letters and spaces
    const words = name.trim().split(/\s+/);
    if (words.length < 3) return "Минимум 3 слова";
    if (!/^([А-Яа-яA-Za-z]+\s*)+$/.test(name)) return "Только буквы и пробелы";
    return null;
}

export default async function CategoriesPage({ searchParams }: ServerComponentProps) {
    const token = (await searchParams)?.token as string;



    return (
        <div className="p-8">
            <header className="flex gap-2 mb-6 text-white">
                <Link href={urlWithParams('/', { token })}>Главная</Link>
                <Link href={urlWithParams('/analytic', { token })}>Аналитика</Link>
                <Link href="/categories" className="ml-auto bg-purple-500 px-4 py-2 rounded text-white hover:bg-purple-600">Категории</Link>
            </header>
            <Categories />
        </div>
    );
} 