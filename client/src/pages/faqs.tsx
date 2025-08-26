import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqItem } from "@/components/faq-item";
import { FaqCardEditable } from "@/components/faq/faq-card-editable";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, HelpCircle, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Faq, FaqCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function Faqs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [votedFaqs, setVotedFaqs] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const isSuperuser = user?.role === 'superuser';

  useEffect(() => {
    const savedVotes = localStorage.getItem('faq-votes');
    if (savedVotes) {
      try {
        const votedIds = JSON.parse(savedVotes);
        setVotedFaqs(new Set(votedIds));
      } catch (error) {
        console.error('Error loading saved votes:', error);
      }
    }
  }, []);

  const { data: faqs, isLoading: faqsLoading } = useQuery<Faq[]>({ queryKey: ["/api/faqs"] });
  const { data: categories, isLoading: categoriesLoading } = useQuery<FaqCategory[]>({ queryKey: ["/api/faq-categories"] });

  const incrementViewsMutation = useMutation({
    mutationFn: async (faqId: string) => apiRequest(`/api/faqs/${faqId}/increment-views`, { method: "PUT", body: JSON.stringify({}) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/faqs"] }),
  });

  const voteHelpfulMutation = useMutation({
    mutationFn: async (faqId: string) => {
      if (votedFaqs.has(faqId)) throw new Error("Ya has votado en esta pregunta frecuente.");
      return await apiRequest(`/api/faqs/${faqId}/vote-helpful`, { method: "PUT", body: JSON.stringify({}) });
    },
    onSuccess: (data, faqId) => {
      const newVotedFaqs = new Set(votedFaqs);
      newVotedFaqs.add(faqId);
      setVotedFaqs(newVotedFaqs);
      localStorage.setItem('faq-votes', JSON.stringify([...newVotedFaqs]));
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "¡Gracias por tu voto!", description: "Tu voto ha sido registrado correctamente." });
    },
    onError: (error) => toast({
      variant: "destructive",
      title: "Error al votar",
      description: error instanceof Error ? error.message : "No se pudo registrar tu voto.",
    }),
  });

  const publishedFaqs = faqs?.filter(faq => faq.isPublished) || [];
  const filteredFaqs = publishedFaqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const faqsByCategory = categories?.map(category => ({
    category,
    faqs: filteredFaqs.filter(faq => faq.categoryId === category.id)
  })).filter(group => group.faqs.length > 0) || [];

  const uncategorizedFaqs = filteredFaqs.filter(faq => !faq.categoryId);
  const handleFaqClick = (faqId: string) => incrementViewsMutation.mutate(faqId);
  const handleVoteHelpful = (faqId: string) => voteHelpfulMutation.mutate(faqId);
  const isLoading = faqsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <AnimatedSection>
        <div className="container mx-auto px-4 py-16">

          {/* Header */}
          <div className="text-center mb-16 bg-gradient-to-r from-blue-50 to-white py-12 rounded-xl shadow-sm">
            <HelpCircle className="h-12 w-12 mx-auto text-blue-500 mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2 drop-shadow-sm">Preguntas Frecuentes</h1>
            <p className="text-xl text-gray-600">Encuentra respuestas rápidas a las preguntas más comunes</p>
          </div>

          {/* Search & Filters */}
          <AnimatedSection delay={0.2}>
            <Card className="mb-10 shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Filter className="h-5 w-5" />
                  Buscar y Filtrar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar en las preguntas y respuestas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>
                  <div className="sm:w-64">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-300">
                        <SelectValue placeholder="Filtrar por categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Categories Overview */}
          {categories && categories.length > 0 && selectedCategory === "all" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {categories.map(cat => {
                const count = publishedFaqs.filter(f => f.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-5 border rounded-2xl shadow hover:shadow-xl hover:bg-blue-50 cursor-pointer transition-all duration-300"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{cat.name}</h3>
                    {cat.description && <p className="text-sm text-gray-600 mb-2">{cat.description}</p>}
                    <Badge variant="outline" className="text-blue-600 font-semibold">{count} {count === 1 ? "pregunta" : "preguntas"}</Badge>
                  </div>
                );
              })}
            </div>
          )}

          {/* FAQs */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-8">

              {selectedCategory === "all" ? (
                <>
                  {faqsByCategory.map(({ category, faqs }) => (
                    <section key={category.id}>
                      <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{category.name}</h2>
                        {category.description && <p className="text-gray-600">{category.description}</p>}
                      </div>
                      <div className="space-y-4">
                        {faqs.map(faq =>
                          isSuperuser ? (
                            <FaqCardEditable key={faq.id} faq={faq} />
                          ) : (
                            <FaqItem
                              key={faq.id}
                              faq={faq}
                              onIncrementViews={() => handleFaqClick(faq.id)}
                              onVoteHelpful={() => handleVoteHelpful(faq.id)}
                              hasVoted={votedFaqs.has(faq.id)}
                              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5"
                            />
                          )
                        )}
                      </div>
                    </section>
                  ))}

                  {uncategorizedFaqs.length > 0 && (
                    <section>
                      <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Preguntas Generales</h2>
                      </div>
                      <div className="space-y-4">
                        {uncategorizedFaqs.map(faq =>
                          isSuperuser ? (
                            <FaqCardEditable key={faq.id} faq={faq} />
                          ) : (
                            <FaqItem
                              key={faq.id}
                              faq={faq}
                              onIncrementViews={() => handleFaqClick(faq.id)}
                              onVoteHelpful={() => handleVoteHelpful(faq.id)}
                              hasVoted={votedFaqs.has(faq.id)}
                              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5"
                            />
                          )
                        )}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{categories?.find(c => c.id === selectedCategory)?.name}</h2>
                      {categories?.find(c => c.id === selectedCategory)?.description && (
                        <p className="text-gray-600">{categories.find(c => c.id === selectedCategory)?.description}</p>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => setSelectedCategory("all")}>Ver Todas las Categorías</Button>
                  </div>
                  <div className="space-y-4">
                    {filteredFaqs.map(faq =>
                      isSuperuser ? <FaqCardEditable key={faq.id} faq={faq} /> :
                      <FaqItem
                        key={faq.id}
                        faq={faq}
                        onIncrementViews={() => handleFaqClick(faq.id)}
                        onVoteHelpful={() => handleVoteHelpful(faq.id)}
                        hasVoted={votedFaqs.has(faq.id)}
                        className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5"
                      />
                    )}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {filteredFaqs.length === 0 && (
                <Card className="text-center py-20 bg-blue-50 rounded-xl shadow-lg">
                  <CardContent>
                    <HelpCircle className="h-20 w-20 mx-auto text-blue-400 mb-6 animate-pulse" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {searchTerm || selectedCategory !== "all" ? "No se encontraron preguntas" : "Aún no hay preguntas frecuentes"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || selectedCategory !== "all" ? "Intenta ajustar tus filtros de búsqueda" : "Las preguntas frecuentes aparecerán aquí una vez que estén disponibles"}
                    </p>
                    {(searchTerm || selectedCategory !== "all") && (
                      <Button 
                        onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Limpiar Filtros
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>
          )}
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
}


// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Navbar } from "@/components/layout/navbar";
// import { Footer } from "@/components/layout/footer";
// import AnimatedSection from "@/components/AnimatedSection";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { FaqItem } from "@/components/faq-item";
// import { FaqCardEditable } from "@/components/faq/faq-card-editable";
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Search, HelpCircle, Filter } from "lucide-react";
// import { apiRequest } from "@/lib/queryClient";
// import type { Faq, FaqCategory } from "@shared/schema";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/use-auth";

// export default function Faqs() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [votedFaqs, setVotedFaqs] = useState<Set<string>>(new Set());
//   const queryClient = useQueryClient();
//   const { toast } = useToast();
//   const { user } = useAuth();
//   const isSuperuser = user?.role === 'superuser';

//   // Load voted FAQs from localStorage on component mount
//   useEffect(() => {
//     const savedVotes = localStorage.getItem('faq-votes');
//     if (savedVotes) {
//       try {
//         const votedIds = JSON.parse(savedVotes);
//         setVotedFaqs(new Set(votedIds));
//       } catch (error) {
//         console.error('Error loading saved votes:', error);
//       }
//     }
//   }, []);

//   const { data: faqs, isLoading: faqsLoading } = useQuery<Faq[]>({
//     queryKey: ["/api/faqs"],
//   });

//   const { data: categories, isLoading: categoriesLoading } = useQuery<FaqCategory[]>({
//     queryKey: ["/api/faq-categories"],
//   });

//   const incrementViewsMutation = useMutation({
//     mutationFn: async (faqId: string) => {
//       return await apiRequest(`/api/faqs/${faqId}/increment-views`, {
//         method: "PUT",
//         body: JSON.stringify({}),
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
//     },
//   });

//   const voteHelpfulMutation = useMutation({
//     mutationFn: async (faqId: string) => {
//       // Check if user has already voted
//       if (votedFaqs.has(faqId)) {
//         throw new Error("Ya has votado en esta pregunta frecuente.");
//       }
      
//       return await apiRequest(`/api/faqs/${faqId}/vote-helpful`, {
//         method: "PUT",
//         body: JSON.stringify({}),
//       });
//     },
//     onSuccess: (data, faqId) => {
//       // Add the FAQ ID to voted set and save to localStorage
//       const newVotedFaqs = new Set(votedFaqs);
//       newVotedFaqs.add(faqId);
//       setVotedFaqs(newVotedFaqs);
      
//       localStorage.setItem('faq-votes', JSON.stringify([...newVotedFaqs]));
      
//       queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
//       toast({
//         title: "¡Gracias por tu voto!",
//         description: "Tu voto ha sido registrado correctamente.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         variant: "destructive",
//         title: "Error al votar",
//         description: error instanceof Error ? error.message : "No se pudo registrar tu voto.",
//       });
//     },
//   });

//   // Filter only published FAQs
//   const publishedFaqs = faqs?.filter(faq => faq.isPublished) || [];

//   const filteredFaqs = publishedFaqs.filter(faq => {
//     const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesCategory = selectedCategory === "all" || faq.categoryId === selectedCategory;

//     return matchesSearch && matchesCategory;
//   });

//   // Group FAQs by category for better organization
//   const faqsByCategory = categories?.map(category => ({
//     category,
//     faqs: filteredFaqs.filter(faq => faq.categoryId === category.id)
//   })).filter(group => group.faqs.length > 0) || [];

//   const uncategorizedFaqs = filteredFaqs.filter(faq => !faq.categoryId);

//   const handleFaqClick = (faqId: string) => {
//     incrementViewsMutation.mutate(faqId);
//   };

//   const handleVoteHelpful = (faqId: string) => {
//     voteHelpfulMutation.mutate(faqId);
//   };

//   const isLoading = faqsLoading || categoriesLoading;

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />
      
//       <AnimatedSection>
//         <div className="container mx-auto px-4 py-16">
//           {/* Header */}
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold text-gray-900 mb-4">
//               Preguntas Frecuentes
//             </h1>
//             <p className="text-xl text-gray-600 mb-8">
//               Encuentra respuestas rápidas a las preguntas más comunes
//             </p>
//           </div>

//           {/* Search and Filters */}
//           <AnimatedSection delay={0.2}>
//             <Card className="mb-8">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Filter className="h-5 w-5" />
//                   Buscar y Filtrar
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <div className="flex-1">
//                     <div className="relative">
//                       <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <Input
//                         placeholder="Buscar en las preguntas y respuestas..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="pl-9"
//                       />
//                     </div>
//                   </div>
//                   <div className="sm:w-64">
//                     <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Filtrar por categoría" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">Todas las categorías</SelectItem>
//                         {categories?.map((category) => (
//                           <SelectItem key={category.id} value={category.id}>
//                             {category.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </AnimatedSection>

//         {/* Categories Overview */}
//         {categories && categories.length > 0 && selectedCategory === "all" && (
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle>Categorías Disponibles</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {categories.map((category) => {
//                   const categoryFaqCount = publishedFaqs.filter(faq => faq.categoryId === category.id).length;
//                   return (
//                     <div
//                       key={category.id}
//                       className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
//                       onClick={() => setSelectedCategory(category.id)}
//                     >
//                       <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
//                       {category.description && (
//                         <p className="text-sm text-gray-600 mb-2">{category.description}</p>
//                       )}
//                       <Badge variant="outline">
//                         {categoryFaqCount} {categoryFaqCount === 1 ? 'pregunta' : 'preguntas'}
//                       </Badge>
//                     </div>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {isLoading ? (
//           <div className="flex items-center justify-center py-16">
//             <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//           </div>
//         ) : (
//           <div className="space-y-8">
//             {/* Display FAQs by category */}
//             {selectedCategory === "all" ? (
//               <>
//                 {faqsByCategory.map(({ category, faqs }) => (
//                   <section key={category.id}>
//                     <div className="mb-6">
//                       <h2 className="text-2xl font-semibold text-gray-900 mb-2">
//                         {category.name}
//                       </h2>
//                       {category.description && (
//                         <p className="text-gray-600">{category.description}</p>
//                       )}
//                     </div>
//                     <div className="space-y-4">
//                       {faqs.map((faq) => 
//                         isSuperuser ? (
//                           <FaqCardEditable key={faq.id} faq={faq} />
//                         ) : (
//                           <FaqItem
//                             key={faq.id}
//                             faq={faq}
//                             onIncrementViews={() => handleFaqClick(faq.id)}
//                             onVoteHelpful={() => handleVoteHelpful(faq.id)}
//                             hasVoted={votedFaqs.has(faq.id)}
//                           />
//                         )
//                       )}
//                     </div>
//                   </section>
//                 ))}

//                 {/* Uncategorized FAQs */}
//                 {uncategorizedFaqs.length > 0 && (
//                   <section>
//                     <div className="mb-6">
//                       <h2 className="text-2xl font-semibold text-gray-900 mb-2">
//                         Preguntas Generales
//                       </h2>
//                     </div>
//                     <div className="space-y-4">
//                       {uncategorizedFaqs.map((faq) => 
//                         isSuperuser ? (
//                           <FaqCardEditable key={faq.id} faq={faq} />
//                         ) : (
//                           <FaqItem
//                             key={faq.id}
//                             faq={faq}
//                             onIncrementViews={() => handleFaqClick(faq.id)}
//                             onVoteHelpful={() => handleVoteHelpful(faq.id)}
//                             hasVoted={votedFaqs.has(faq.id)}
//                           />
//                         )
//                       )}
//                     </div>
//                   </section>
//                 )}
//               </>
//             ) : (
//               // Display filtered FAQs
//               <section>
//                 {selectedCategory !== "all" && (
//                   <div className="mb-6 flex items-center justify-between">
//                     <div>
//                       <h2 className="text-2xl font-semibold text-gray-900 mb-2">
//                         {categories?.find(c => c.id === selectedCategory)?.name}
//                       </h2>
//                       {categories?.find(c => c.id === selectedCategory)?.description && (
//                         <p className="text-gray-600">
//                           {categories.find(c => c.id === selectedCategory)?.description}
//                         </p>
//                       )}
//                     </div>
//                     <Button variant="outline" onClick={() => setSelectedCategory("all")}>
//                       Ver Todas las Categorías
//                     </Button>
//                   </div>
//                 )}
//                 <div className="space-y-4">
//                   {filteredFaqs.map((faq) => 
//                     isSuperuser ? (
//                       <FaqCardEditable key={faq.id} faq={faq} />
//                     ) : (
//                       <FaqItem
//                         key={faq.id}
//                         faq={faq}
//                         onIncrementViews={() => handleFaqClick(faq.id)}
//                         onVoteHelpful={() => handleVoteHelpful(faq.id)}
//                         hasVoted={votedFaqs.has(faq.id)}
//                       />
//                     )
//                   )}
//                 </div>
//               </section>
//             )}

//             {/* Empty State */}
//             {filteredFaqs.length === 0 && (
//               <Card className="text-center py-16">
//                 <CardContent>
//                   <HelpCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                     {searchTerm || selectedCategory !== "all" 
//                       ? "No se encontraron preguntas"
//                       : "Aún no hay preguntas frecuentes"
//                     }
//                   </h3>
//                   <p className="text-gray-600 mb-6">
//                     {searchTerm || selectedCategory !== "all"
//                       ? "Intenta ajustar tus filtros de búsqueda"
//                       : "Las preguntas frecuentes aparecerán aquí una vez que estén disponibles"
//                     }
//                   </p>
//                   {(searchTerm || selectedCategory !== "all") && (
//                     <Button 
//                       onClick={() => {
//                         setSearchTerm("");
//                         setSelectedCategory("all");
//                       }}
//                     >
//                       Limpiar Filtros
//                     </Button>
//                   )}
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         )}
//         </div>
//       </AnimatedSection>

//       <Footer />
//     </div>
//   );
// }
