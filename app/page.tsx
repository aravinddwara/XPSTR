import { createClient } from "@/lib/supabase/server"
import { tmdbClient } from "@/lib/tmdb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Play, Info, Search, Menu } from "lucide-react"

interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  runtime: number | null
  genres: any
  tmdb_id: number
  trailer_url: string | null
  slug?: string // Added slug to the Movie interface
}

export default async function HomePage() {
  const supabase = await createClient()

  // Get featured movies (highest rated)
  const { data: featuredMovies } = await supabase
    .from("movies")
    .select("*")
    .order("vote_average", { ascending: false })
    .limit(5)

  // Get recent movies
  const { data: recentMovies } = await supabase
    .from("movies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12)

  // Get popular movies
  const { data: popularMovies } = await supabase
    .from("movies")
    .select("*")
    .order("vote_count", { ascending: false })
    .limit(12)

  const heroMovie = featuredMovies?.[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-primary">
                StreamFlix
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/movies" className="text-foreground hover:text-primary transition-colors">
                  Movies
                </Link>
                <Link href="/search" className="text-foreground hover:text-primary transition-colors">
                  Search
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild size="sm" variant="ghost" className="text-foreground hover:text-primary">
                <Link href="/search">
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/login">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-screen flex items-center">
          <div className="absolute inset-0">
            {heroMovie.backdrop_path ? (
              <Image
                src={tmdbClient.getBackdropUrl(heroMovie.backdrop_path) || "/placeholder.svg?height=1080&width=1920"}
                alt={heroMovie.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="relative container mx-auto px-4 pt-20">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 text-balance">{heroMovie.title}</h1>
              <p className="text-lg text-muted-foreground mb-6 line-clamp-3 text-pretty">{heroMovie.overview}</p>
              <div className="flex items-center gap-4 mb-8">
                <Badge variant="secondary" className="text-sm">
                  {heroMovie.vote_average.toFixed(1)}⭐
                </Badge>
                <span className="text-muted-foreground">{heroMovie.release_date}</span>
                {heroMovie.runtime && <span className="text-muted-foreground">{heroMovie.runtime} min</span>}
              </div>
              <div className="flex gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href={`/watch/${heroMovie.slug || heroMovie.id}`}>
                    <Play className="h-5 w-5 mr-2" />
                    Watch Now
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-background/20 backdrop-blur-sm">
                  <Link href={`/movie/${heroMovie.slug || heroMovie.id}`}>
                    <Info className="h-5 w-5 mr-2" />
                    More Info
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Movie Sections */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Recent Movies */}
        {recentMovies && recentMovies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recently Added</h2>
              <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                <Link href="/movies?sort=recent">View All</Link>
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentMovies.map((movie: Movie) => (
                <Link key={movie.id} href={`/movie/${movie.slug || movie.id}`} className="flex-shrink-0">
                  <Card className="border-border bg-card hover:scale-105 transition-transform duration-200 overflow-hidden w-48">
                    <div className="aspect-[2/3] relative">
                      {movie.poster_path ? (
                        <Image
                          src={tmdbClient.getPosterUrl(movie.poster_path) || "/placeholder.svg?height=450&width=300"}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-sm text-center p-2">{movie.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm font-semibold line-clamp-2">{movie.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {movie.vote_average.toFixed(1)}⭐
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popular Movies */}
        {popularMovies && popularMovies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Popular Movies</h2>
              <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                <Link href="/movies?sort=popular">View All</Link>
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {popularMovies.map((movie: Movie) => (
                <Link key={movie.id} href={`/movie/${movie.slug || movie.id}`} className="flex-shrink-0">
                  <Card className="border-border bg-card hover:scale-105 transition-transform duration-200 overflow-hidden w-48">
                    <div className="aspect-[2/3] relative">
                      {movie.poster_path ? (
                        <Image
                          src={tmdbClient.getPosterUrl(movie.poster_path) || "/placeholder.svg?height=450&width=300"}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-sm text-center p-2">{movie.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm font-semibold line-clamp-2">{movie.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {movie.vote_average.toFixed(1)}⭐
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Movies */}
        {featuredMovies && featuredMovies.length > 1 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Top Rated</h2>
              <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                <Link href="/movies?sort=rating">View All</Link>
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {featuredMovies.slice(1).map((movie: Movie) => (
                <Link key={movie.id} href={`/movie/${movie.slug || movie.id}`} className="flex-shrink-0">
                  <Card className="border-border bg-card hover:scale-105 transition-transform duration-200 overflow-hidden w-48">
                    <div className="aspect-[2/3] relative">
                      {movie.poster_path ? (
                        <Image
                          src={tmdbClient.getPosterUrl(movie.poster_path) || "/placeholder.svg?height=450&width=300"}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-sm text-center p-2">{movie.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm font-semibold line-clamp-2">{movie.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {movie.vote_average.toFixed(1)}⭐
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!recentMovies || recentMovies.length === 0) && (!popularMovies || popularMovies.length === 0) && (
          <section className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">No Movies Available</h2>
            <p className="text-muted-foreground mb-6">
              It looks like there are no movies in the database yet. Check back later or contact an administrator.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">StreamFlix</h3>
              <p className="text-muted-foreground text-sm">
                Your ultimate destination for streaming the best movies and entertainment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Browse</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/movies" className="hover:text-foreground">
                    All Movies
                  </Link>
                </li>
                <li>
                  <Link href="/movies?sort=recent" className="hover:text-foreground">
                    Recently Added
                  </Link>
                </li>
                <li>
                  <Link href="/movies?sort=popular" className="hover:text-foreground">
                    Popular
                  </Link>
                </li>
                <li>
                  <Link href="/movies?sort=rating" className="hover:text-foreground">
                    Top Rated
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Admin</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/admin/login" className="hover:text-foreground">
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 StreamFlix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
