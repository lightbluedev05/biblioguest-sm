


function HeroSection() {
    return (
        <section>
            
                
            

            {/* Imagen Central */}
            <div className="relative w-full mb-16 ">
                <div className="relative overflow-hidden shadow-2xl h-[600px]  ">
                <img 
                    src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&h=600&fit=crop" 
                    alt="Biblioteca Universitaria" 
                    className="w-full h-full object-cover"

                />
                
            
                <div className="absolute inset-0 flex  items-center justify-center px-6 mb-10">
                <div className="bg-neutral/30 backdrop-blur-md rounded-xl p-6 md:p-8 max-w-2xl text-center border border-white/10 shadow-xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-surface mb-2">
                    Tu Centro de Conocimiento
                    </h2>
                    <p className="text-lg text-surface/80">
                    Accede a miles de recursos académicos, espacios de estudio y servicios diseñados para tu éxito universitario
                    </p>
                </div>

                

                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2  text-white text-center ">
                    <h3 className="text-3xl font-bold mb-2">Explora Nuestras Colecciones</h3>
                    <p className="text-lg opacity-90">Más de 100,000 títulos disponibles</p>
                </div>
                
                </div>
            </div>


            

            
        </section>
        
        
    )
}

export default HeroSection

