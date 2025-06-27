'use client'

import { categoriesService } from "@/services/categories-service"
import { useState } from "react";

export const Categories = () => {
    const categories = categoriesService.getAllCategories() ?? [];
    const [category, setCategory] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const showMessage = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    }

    const handleDelete = (cat: string) => {
        categoriesService.deleteCategory(cat);
        showMessage('Категория удалена!')
    }

    const validateCategory = (cat: string) => {
        if (cat.length < 3) {
            return "Минимум 3 символа";
        }
        return null;
    }

    const handleAddCategory = () => {
        const validationMessage = validateCategory(category);
        if (validationMessage) {
            setError(validationMessage);
            return;
        }
        categoriesService.addCategory(category);
        showMessage("Категория сохранена!");
        setCategory("");
        setError(null);
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Добавить категорию</h1>
            <div>
                <input
                    type="text"
                    className="border p-2 w-full mb-2"
                    placeholder="Название категории"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                />
                {error && <div className="text-red-600 mb-2">{error}</div>}
                {successMessage && <div className="text-green-600 mb-2">{successMessage}</div>}
                <button
                    type="submit"
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    onClick={handleAddCategory}
                >
                    Сохранить
                </button>
            </div>
            <h2 className="text-xl font-semibold mt-6 mb-2">Текущие категории</h2>
            <ul className="flex flex-col gap-2">
                {categories.map((cat: string, idx: number) => (
                    <li key={cat + idx} className="flex items-center justify-between text-white border p-2 rounded-md bg-purple-500">
                        <span>{cat}</span>
                        <button
                            type="button"
                            className="text-white bg-red-600 rounded-md p-2"
                            onClick={() => handleDelete(cat)}
                        >
                            Удалить
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
