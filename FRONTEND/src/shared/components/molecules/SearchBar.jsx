    import Input from "../atoms/Input";
    import Button from "../atoms/Button";

    function SearchBar({
    placeholder = "Buscar un libro, autor o tema...",
    buttonLabel = "Buscar",
    value,
    onChange,
    onSearch, 
    }) {
    const handleSubmit = (e) => {
        e.preventDefault(); 
        if (onSearch) onSearch(); 
    };

    return (
        <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-3 w-full"
        >
        <Input
            placeholder={placeholder}
            value = {value}
            onChange={onChange} 
            className="h-14 w-30 text-base"
        />
        <Button variant="primary" onClick={handleSubmit}
            className="h-14  whitespace-nowrap"
        >
            {buttonLabel}
        </Button>
        </form>
    );
    }

    export default SearchBar;
