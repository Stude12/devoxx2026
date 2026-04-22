export type CardSize = 'small' | 'medium' | 'large';

export const CARD_DIMENSIONS: Record<CardSize, { width: number; height: number }> = {
    small:  { width: 100, height: 130 },
    medium: { width: 140, height: 180 },
    large:  { width: 180, height: 230 },
};

export interface Speaker {
    id: string;
    name: string;
    topic: string;
    points: number;
    color: string;
    size: CardSize;
    image?: string;
}

export const SPEAKERS: Speaker[] = [
    {
        id: 'quarkus-native',
        name: 'Emmanuel Bernard',
        topic: 'Quarkus et Runtime Natif',
        points: 200,
        color: '#FF6B6B',
        size: 'small'
    },
    {
        id: 'kubernetes-devoxx',
        name: 'Stéphane Chédelle',
        topic: 'Kubernetes en Production',
        points: 120,
        color: '#4ECDC4',
        size: 'medium'
    },
    {
        id: 'java-virtual-threads',
        name: 'José Paumard',
        topic: 'Virtual Threads & Loom',
        points: 180,
        color: '#FFE66D',
        size: 'small'
    },
    {
        id: 'springboot-secrets',
        name: 'Stéphane Nicoll',
        topic: 'Spring Boot 3.x Deep Dive',
        points: 80,
        color: '#A8E6CF',
        size: 'large'
    },
    {
        id: 'ai-java-llm',
        name: 'Fabrice Matrat',
        topic: 'AI & LLM avec Java',
        points: 220,
        color: '#FF8B94',
        size: 'small'
    },
    {
        id: 'reactive-systems',
        name: 'Clément Escoffier',
        topic: 'Reactive Systems et Mutiny',
        points: 130,
        color: '#95E1D3',
        size: 'medium'
    },
    {
        id: 'microservices-patterns',
        name: 'Chris Richardson',
        topic: 'Microservices Patterns',
        points: 100,
        color: '#C7CEEA',
        size: 'large'
    },
    {
        id: 'security-best-practices',
        name: 'François Gérard',
        topic: 'Sécurité dans les Apps Java',
        points: 190,
        color: '#FF9999',
        size: 'small'
    },
    {
        id: 'cloud-native-java',
        name: 'Mark Heckler',
        topic: 'Cloud Native Java',
        points: 90,
        color: '#FFA07A',
        size: 'large'
    },
    {
        id: 'graalvm-performance',
        name: 'Alina Yurova',
        topic: 'GraalVM Performance Tuning',
        points: 140,
        color: '#98D8C8',
        size: 'medium'
    },
    {
        id: 'testing-strategies',
        name: 'Maarten Balliauw',
        topic: 'Advanced Testing Strategies',
        points: 150,
        color: '#F7DC6F',
        size: 'medium'
    },
    {
        id: 'devops-automation',
        name: 'David Buonomo',
        topic: 'DevOps & Automation',
        points: 70,
        color: '#BB8FCE',
        size: 'large'
    }
];
