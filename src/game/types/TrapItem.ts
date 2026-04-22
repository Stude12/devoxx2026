export interface TrapItem {
    id: string;
    name: string;
    emoji: string;
    penalty: 'life' | 'score';
    penaltyValue: number;
    color: string;
}

export const TRAP_ITEMS: TrapItem[] = [
    {
        id: 'sandwich',
        name: 'Sandwich',
        emoji: '🥪',
        penalty: 'life',
        penaltyValue: 1,
        color: '#8B4513'
    },
    {
        id: 'tshirt',
        name: 'T-shirt Devoxx',
        emoji: '👕',
        penalty: 'life',
        penaltyValue: 1,
        color: '#4169E1'
    },
    {
        id: 'coffee',
        name: 'Café',
        emoji: '☕',
        penalty: 'score',
        penaltyValue: 200,
        color: '#6F4E37'
    },
    {
        id: 'badge',
        name: 'Badge',
        emoji: '🏷️',
        penalty: 'life',
        penaltyValue: 1,
        color: '#DAA520'
    },
    {
        id: 'laptop',
        name: 'Laptop',
        emoji: '💻',
        penalty: 'score',
        penaltyValue: 300,
        color: '#708090'
    },
    {
        id: 'sticker',
        name: 'Stickers',
        emoji: '⭐',
        penalty: 'score',
        penaltyValue: 150,
        color: '#FF69B4'
    }
];
