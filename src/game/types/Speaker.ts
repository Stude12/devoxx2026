export interface Speaker {
    id: string;
    name: string;
    topic: string;
    points: number;
    color: string;
    image?: string;
}

export const SPEAKERS: Speaker[] = [
    {
        id: 'quarkus-native',
        name: 'Emmanuel Bernard',
        topic: 'Quarkus et Runtime Natif',
        points: 100,
        color: '#FF6B6B'
    },
    {
        id: 'kubernetes-devoxx',
        name: 'Stéphane Chédelle',
        topic: 'Kubernetes en Production',
        points: 120,
        color: '#4ECDC4'
    },
    {
        id: 'java-virtual-threads',
        name: 'José Paumard',
        topic: 'Virtual Threads & Loom',
        points: 110,
        color: '#FFE66D'
    },
    {
        id: 'springboot-secrets',
        name: 'Stéphane Nicoll',
        topic: 'Spring Boot 3.x Deep Dive',
        points: 130,
        color: '#A8E6CF'
    },
    {
        id: 'ai-java-llm',
        name: 'Fabrice Matrat',
        topic: 'AI & LLM avec Java',
        points: 140,
        color: '#FF8B94'
    },
    {
        id: 'reactive-systems',
        name: 'Clément Escoffier',
        topic: 'Reactive Systems et Mutiny',
        points: 115,
        color: '#95E1D3'
    },
    {
        id: 'microservices-patterns',
        name: 'Chris Richardson',
        topic: 'Microservices Patterns',
        points: 125,
        color: '#C7CEEA'
    },
    {
        id: 'security-best-practices',
        name: 'François Gérard',
        topic: 'Sécurité dans les Apps Java',
        points: 135,
        color: '#FF9999'
    },
    {
        id: 'cloud-native-java',
        name: 'Mark Heckler',
        topic: 'Cloud Native Java',
        points: 105,
        color: '#FFA07A'
    },
    {
        id: 'graalvm-performance',
        name: 'Alina Yurova',
        topic: 'GraalVM Performance Tuning',
        points: 115,
        color: '#98D8C8'
    },
    {
        id: 'testing-strategies',
        name: 'Maarten Balliauw',
        topic: 'Advanced Testing Strategies',
        points: 100,
        color: '#F7DC6F'
    },
    {
        id: 'devops-automation',
        name: 'David Buonomo',
        topic: 'DevOps & Automation',
        points: 110,
        color: '#BB8FCE'
    }
];
