interface AddressBarProps {
    address: string;
    onNavigate: (url: string) => void;
    onReload: () => void;
    isLoading?: boolean;
}
export declare const AddressBar: ({ address, onNavigate, onReload, isLoading }: AddressBarProps) => import("react/jsx-runtime").JSX.Element;
export {};
