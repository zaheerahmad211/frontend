import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const DUMMY_BASE_URL = 'https://dummyjson.com/products';
const FAKE_STORE_URL = 'https://fakestoreapi.com/products';

export const fetchAllProducts = async () => {
    try {
        const safeGet = (url, isDummyJson = true) =>
            axios.get(url).catch(err => {
                console.warn(`Failed to fetch ${url}`, err.message);
                return { data: isDummyJson ? { products: [] } : [] };
            });

        // Fetch original + new categories
        const [
            fakeStoreRes,
            furnitureRes,
            sportsRes,
            homeRes,
            mensShirtsRes,
            mensShoesRes,
            jeweleryRes,
            smartphonesRes,
            laptopsRes,
            mobileAccessoriesRes,
            womensDressesRes,
            womensShoesRes,
            womensBagsRes,
            topsRes,
            localRes
        ] = await Promise.all([
            safeGet(FAKE_STORE_URL, false),
            safeGet(`${DUMMY_BASE_URL}/category/furniture`),
            safeGet(`${DUMMY_BASE_URL}/category/sports-accessories`),
            safeGet(`${DUMMY_BASE_URL}/category/home-decoration`),
            safeGet(`${DUMMY_BASE_URL}/category/mens-shirts`),
            safeGet(`${DUMMY_BASE_URL}/category/mens-shoes`),
            safeGet(`${DUMMY_BASE_URL}/category/womens-jewellery`),
            safeGet(`${DUMMY_BASE_URL}/category/smartphones`),
            safeGet(`${DUMMY_BASE_URL}/category/laptops`),
            safeGet(`${DUMMY_BASE_URL}/category/mobile-accessories`),
            safeGet(`${DUMMY_BASE_URL}/category/womens-dresses`),
            safeGet(`${DUMMY_BASE_URL}/category/womens-shoes`),
            safeGet(`${DUMMY_BASE_URL}/category/womens-bags`),
            safeGet(`${DUMMY_BASE_URL}/category/tops`),
            axios.get(`${API}/api/products`).catch(() => ({ data: [] }))
        ]);

        const fakeStoreProducts = fakeStoreRes.data;

        // Helper to map DummyJSON to app structure
        const normalize = (products, categoryOverride) => products.map(p => ({
            id: p.id + 1000,
            title: p.title,
            price: p.price,
            category: categoryOverride || p.category,
            image: p.thumbnail || (p.images && p.images[0]) || "https://placehold.co/600x400?text=No+Image",
            rating: { rate: p.rating, count: 0 },
            description: p.description
        }));

        // Normalize New Data
        const furniture = normalize(furnitureRes.data.products, 'furniture');
        const sports = normalize(sportsRes.data.products, 'sports');
        const home = normalize(homeRes.data.products);

        // Map new categories to existing ones
        const mensClothing = [
            ...normalize(mensShirtsRes.data.products, "men's clothing"),
            ...normalize(mensShoesRes.data.products, "men's clothing")
        ];

        const jewelery = normalize(jeweleryRes.data.products, 'jewelery');

        const electronics = [
            ...normalize(smartphonesRes.data.products, 'electronics'),
            ...normalize(laptopsRes.data.products, 'electronics'),
            ...normalize(mobileAccessoriesRes.data.products, 'electronics')
        ];

        const womensClothing = [
            ...normalize(womensDressesRes.data.products, "women's clothing"),
            ...normalize(womensShoesRes.data.products, "women's clothing"),
            ...normalize(womensBagsRes.data.products, "women's clothing"),
            ...normalize(topsRes.data.products, "women's clothing")
        ];

        // Normalize Local Data
        const localProducts = localRes.data.map(p => ({
            id: p._id,
            title: p.name,
            price: p.price,
            category: p.category,
            image: p.image.startsWith('/uploads/') ? `${API}${p.image}` : p.image,
            rating: { rate: 5, count: 10 },
            description: p.description,
            stock: p.stock,
            seller: p.seller
        }));

        // Combine everything
        return [
            ...localProducts,
            ...fakeStoreProducts,
            ...furniture,
            ...sports,
            ...home,
            ...mensClothing,
            ...womensClothing,
            ...jewelery,
            ...electronics
        ];
    } catch (error) {
        console.error("Failed to fetch products from API:", error);
        return [];
    }
};

export const fetchProductById = async (id) => {
    try {
        // If ID is a MongoDB ObjectId (24 chars hex), it's a local product
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

        if (isMongoId) {
            const { data } = await axios.get(`${API}/api/products/${id}`);
            return {
                id: data._id,
                title: data.name,
                price: data.price,
                category: data.category,
                image: data.image.startsWith('/uploads/') ? `${API}${data.image}` : data.image,
                rating: { rate: 5, count: 10 },
                description: data.description,
                stock: data.stock,
                seller: data.seller
            };
        }

        const numId = Number(id);
        // If ID > 1000, it's a DummyJSON product
        if (numId > 1000) {
            const realId = numId - 1000;
            const { data } = await axios.get(`${DUMMY_BASE_URL}/${realId}`);

            // Normalize single product
            return {
                id: numId,
                title: data.title,
                price: data.price,
                category: data.category,
                image: data.thumbnail || (data.images && data.images[0]) || "https://placehold.co/600x400?text=No+Image",
                rating: { rate: data.rating, count: 0 },
                description: data.description,
                stock: data.stock || 10
            };
        } else {
            // Otherwise it's FakeStoreAPI
            const { data } = await axios.get(`${FAKE_STORE_URL}/${id}`);
            return {
                ...data,
                stock: 10 // Fake API doesn't return stock
            };
        }
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    }
}

export const fetchCategories = async () => {
    try {
        const response = await axios.get(`${FAKE_STORE_URL}/categories`);
        return [...response.data, 'furniture', 'sports', 'home-decoration'];
    } catch (error) {
        return ['electronics', 'jewelery', 'men\'s clothing', 'women\'s clothing', 'furniture', 'sports', 'home-decoration'];
    }
}
