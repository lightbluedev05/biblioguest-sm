    function NewsCard({ title, description, date, highlight = false }) {
    return (
        <div
        className={`rounded-xl shadow-md p-6 border ${
            highlight
            ? "bg-primary text-white" : "bg-secondary border-neutral/10 text-neutral"
        } hover:scale-[1.02] transition-transform duration-300`}
        >
        <p className="text-sm opacity-80 mb-1">{date}</p>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-sm opacity-80">{description}</p>
        </div>
    );
    }

    export default NewsCard;
