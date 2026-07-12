    import NewsCard from "../molecules/NewsCard";
    /*import { Bell, ArrowRight } from "lucide-react";*/

    function NewsSection() {
    return (
        <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Título */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
             {/*<Bell className="h-6 w-6 text-primary" /> */}
            <h3 className="text-3xl font-bold text-neutral">Noticias y Avisos</h3>
            </div>

            <button className="text-primary hover:text-secondary font-medium flex items-center">
            Ver todas {/* <ArrowRight className="ml-1 h-4 w-4" /> */}
            </button>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid md:grid-cols-2 gap-6">
            <NewsCard
            highlight
            date="30 Nov"
            title="Actualiza tu Carnet Universitario"
            description="Renueva tu carnet para el próximo semestre y mantén acceso total a este servicio "
            />

            <NewsCard
            date="Próximamente"
            title="Nueva actualizacion"
            description="Estamos mejorando la plataforma para ofrecerte una mejor experiencia."
            />
        </div>
        </section>
    );
    }

    export default NewsSection;
