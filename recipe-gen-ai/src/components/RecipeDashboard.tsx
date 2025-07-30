import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, ChefHat, Sparkles, Clock, Users } from 'lucide-react';
import heroImage from '@/assets/hero-cooking.jpg';

interface Recipe {
  id: string;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  is_ai_generated: boolean;
  created_at: string;
}

interface Profile {
  full_name: string;
  cooking_skill_level: string;
  dietary_preferences: string[];
}

export function RecipeDashboard() {
  const { user, signOut } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (recipesError) {
        console.error('Error fetching recipes:', recipesError);
        toast({
          title: "Error loading recipes",
          description: recipesError.message,
          variant: "destructive",
        });
      } else {
        setRecipes(recipesData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleRecipe = async () => {
    const sampleRecipe = {
      user_id: user?.id,
      title: "AI-Generated Pasta Primavera",
      description: "A delicious spring pasta with fresh vegetables and herbs",
      ingredients: [
        "8 oz pasta",
        "1 bell pepper, sliced",
        "1 zucchini, sliced",
        "1 cup cherry tomatoes",
        "2 cloves garlic, minced",
        "2 tbsp olive oil",
        "Salt and pepper to taste",
        "Fresh basil leaves"
      ],
      instructions: [
        "Cook pasta according to package directions",
        "Heat olive oil in a large pan",
        "Add garlic and cook for 1 minute",
        "Add vegetables and cook until tender",
        "Toss with cooked pasta and fresh basil",
        "Season with salt and pepper"
      ],
      prep_time: 15,
      cook_time: 20,
      servings: 4,
      difficulty: "easy",
      cuisine_type: "Italian",
      dietary_tags: ["vegetarian"],
      is_ai_generated: true
    };

    const { error } = await supabase
      .from('recipes')
      .insert([sampleRecipe]);

    if (error) {
      toast({
        title: "Error creating recipe",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Recipe generated!",
        description: "Your AI recipe has been created.",
      });
      fetchUserData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Recipe Magic</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome back, {profile?.full_name || user?.email}!
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-8 h-64">
          <img 
            src={heroImage} 
            alt="Cooking inspiration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
            <div className="flex flex-col justify-center h-full px-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Ready to cook something amazing?
              </h2>
              <p className="text-white/90 mb-4 max-w-md">
                Generate personalized recipes with AI or browse your collection
              </p>
              <Button 
                variant="hero" 
                size="hero"
                onClick={generateSampleRecipe}
                className="w-fit"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Recipe
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="recipes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="recipes">My Recipes</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Your Recipe Collection</h3>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
            </div>

            {recipes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ChefHat className="w-12 h-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No recipes yet</h4>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by generating your first AI recipe or adding one manually
                  </p>
                  <Button onClick={generateSampleRecipe}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Your First Recipe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <Card key={recipe.id} className="hover:shadow-warm transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-6">{recipe.title}</CardTitle>
                        {recipe.is_ai_generated && (
                          <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                            AI Generated
                          </div>
                        )}
                      </div>
                      <CardDescription>{recipe.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {recipe.servings} servings
                        </div>
                        <div className="capitalize">
                          {recipe.difficulty}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Discover New Recipes</h3>
              <p className="text-muted-foreground">Explore AI-generated recipes from the community</p>
            </div>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">Coming Soon</h4>
                <p className="text-muted-foreground text-center">
                  Discover amazing recipes shared by other users and get inspired!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}