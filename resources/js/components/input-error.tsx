export function InputError({ message, className = '' }: { message?: string; className?: string }) {
    if (!message) {
return null;
}

    return <p className={`text-danger text-sm ${className}`}>{message}</p>;
}

export default InputError;
