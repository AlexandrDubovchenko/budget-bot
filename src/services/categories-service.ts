import { isBrowser } from "@/utils/is-browser";

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

function setDefaultCategories() {
    if (isBrowser()) {
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    }
}

function getAllCategories(): string[] | undefined {
    if (isBrowser()) {
        const stored = localStorage.getItem(CATEGORY_KEY);
        if (stored) {
            return JSON.parse(stored);
        } else {
            return undefined;
        }
    }
    return undefined;
}

function getDefaultCategories(): string[] | null {
    if (isBrowser()) {
        const stored = localStorage.getItem(CATEGORY_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    }
    return null;
}

function addCategory(category: string) {
    if (isBrowser()) {
        const categories = getAllCategories() ?? [];
        categories.unshift(category);
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    }
}

function deleteCategory(category: string) {
    if (isBrowser()) {
        const categories = (getAllCategories() ?? []).filter((cat) => cat !== category);
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    }
}

export const categoriesService = { deleteCategory, addCategory, getDefaultCategories, getAllCategories, setDefaultCategories }; 