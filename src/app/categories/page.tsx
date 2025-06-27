import Link from "next/link";
import { urlWithParams } from "@/utils/url";
import { ServerComponentProps } from "@/types";
import { Categories } from "@/components/Categories";

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