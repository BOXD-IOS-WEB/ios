import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RaceCard } from "@/components/RaceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, User, List as ListIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchAll, searchRaces, searchUsers, searchLists, SearchResult } from "@/services/search";
import { getPosterUrl } from "@/services/f1Api";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      if (activeTab === 'all') {
        searchResults = await searchAll(searchTerm);
      } else if (activeTab === 'races') {
        searchResults = await searchRaces(searchTerm, 20);
      } else if (activeTab === 'users') {
        searchResults = await searchUsers(searchTerm, 20);
      } else if (activeTab === 'lists') {
        searchResults = await searchLists(searchTerm, 20);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      performSearch(q);
    }
  }, [activeTab]);

  const raceResults = results.filter(r => r.type === 'race');
  const userResults = results.filter(r => r.type === 'user');
  const listResults = results.filter(r => r.type === 'list');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-6">Search</h1>

            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for races, users, lists..."
                className="pl-12 h-14 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>

          {query && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="races">Races</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="lists">Lists</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-6">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Searching...</div>
                ) : results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No results found for "{query}"</p>
                    <p className="text-sm mt-2">Try different keywords</p>
                  </div>
                ) : (
                  <>
                    {raceResults.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Races</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {raceResults.map((result) => {
                            const posterUrl = getPosterUrl(result.metadata?.circuit_short_name || result.metadata?.circuit_key);
                            return (
                              <RaceCard
                                key={result.id}
                                season={result.metadata?.year}
                                round={result.metadata?.meeting_key}
                                gpName={result.title}
                                circuit={result.metadata?.circuit_short_name}
                                date={result.metadata?.date_start}
                                country={result.metadata?.country_code}
                                posterUrl={posterUrl || undefined}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {userResults.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Users</h2>
                        <div className="space-y-2">
                          {userResults.map((result) => (
                            <Card
                              key={result.id}
                              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => navigate(`/user/${result.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                  <User className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-semibold">{result.title}</p>
                                  <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {listResults.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Lists</h2>
                        <div className="space-y-2">
                          {listResults.map((result) => (
                            <Card
                              key={result.id}
                              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => navigate(`/list/${result.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                  <ListIcon className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-semibold">{result.title}</p>
                                  <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="races" className="mt-6">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Searching...</div>
                ) : raceResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No races found for "{query}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {raceResults.map((result) => {
                      const posterUrl = getPosterUrl(result.metadata?.circuit_short_name || result.metadata?.circuit_key);
                      return (
                        <RaceCard
                          key={result.id}
                          season={result.metadata?.year}
                          round={result.metadata?.meeting_key}
                          gpName={result.title}
                          circuit={result.metadata?.circuit_short_name}
                          date={result.metadata?.date_start}
                          country={result.metadata?.country_code}
                          posterUrl={posterUrl || undefined}
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Searching...</div>
                ) : userResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No users found for "{query}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userResults.map((result) => (
                      <Card
                        key={result.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/user/${result.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold">{result.title}</p>
                            <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lists" className="mt-6">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Searching...</div>
                ) : listResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No lists found for "{query}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {listResults.map((result) => (
                      <Card
                        key={result.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/list/${result.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <ListIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold">{result.title}</p>
                            <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
