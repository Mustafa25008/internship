import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Plus,
  ChefHat,
  Sparkles,
  Clock,
  Users,
  Heart,
  Mail,
  Github,
  Share2,
} from "lucide-react";
import heroImage from "@/assets/hero-cooking.jpg";
import { AddRecipeForm } from "./AddRecipeForm";
import { RecipeDetailModal } from "./RecipeDetailModal";
import { constructNow } from "date-fns";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  cuisine_type?: string;
  dietary_tags?: string[];
  is_ai_generated: boolean;
  is_public?: boolean;
  user_id?: string;
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
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipePrompt, setRecipePrompt] = useState<string>("");
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
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (recipesError) {
        console.error("Error fetching recipes:", recipesError);
        toast({
          title: "Error loading recipes",
          description: recipesError.message,
          variant: "destructive",
        });
      } else {
        const formattedRecipes = (recipesData || []).map((recipe) => ({
          ...recipe,
          ingredients: Array.isArray(recipe.ingredients)
            ? (recipe.ingredients as string[])
            : [],
          instructions: Array.isArray(recipe.instructions)
            ? (recipe.instructions as string[])
            : [],
        }));
        setRecipes(formattedRecipes);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicRecipes = async () => {
    setDiscoverLoading(true);
    try {
      const { data: recipesData, error: recipesError } = await supabase
        .from("recipes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (recipesError) {
        console.error("Error fetching public recipes:", recipesError);
        toast({
          title: "Error loading public recipes",
          description: recipesError.message,
          variant: "destructive",
        });
      } else {
        const formattedRecipes = (recipesData || []).map((recipe) => ({
          ...recipe,
          ingredients: Array.isArray(recipe.ingredients)
            ? (recipe.ingredients as string[])
            : [],
          instructions: Array.isArray(recipe.instructions)
            ? (recipe.instructions as string[])
            : [],
        }));
        setPublicRecipes(formattedRecipes);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setDiscoverLoading(false);
    }
  };

  const shareRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from("recipes")
        .update({ is_public: true })
        .eq("id", recipeId)
        .eq("user_id", user?.id);

      if (error) {
        toast({
          title: "Error sharing recipe",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recipe shared!",
          description:
            "Your recipe is now public and visible in the Discover tab.",
        });
        fetchUserData(); // Refresh user recipes
        fetchPublicRecipes(); // Refresh public recipes
      }
    } catch (error) {
      console.error("Error sharing recipe:", error);
    }
  };
  //AI Recipe Generation
  const generateAIRecipe = async () => {
    if (!recipePrompt.trim()) {
      toast({
        title: "Please enter a recipe request",
        description: "Tell us what recipe you'd like to generate",
        variant: "destructive",
      });
      return;
    }

    const recipeName = recipePrompt
      .replace(/write a recipe of|recipe of|recipe for|make|cook/gi, "")
      .trim();
    const capitalizedName = recipeName.charAt(0).toUpperCase() + recipeName.slice(1);
    const webhookURL = import.meta.env.VITE_WEBHOOK_URL;
    try {
      console.log("Sending request to webhook:", webhookURL);
      toast({
        title: "Generating recipe...",
        description: "This may take a moment. Please wait.",
        duration: 5000,
        variant: "default",
      });
      console.log("Recipe Prompt:", recipePrompt);
      const res = await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: recipePrompt }),
      });
      const data = await res.json();
      console.log("AI Response:", data);
      const outputText = data[0].output;
      console.log("AI Output:", outputText);

      // Extract fields from the plain text
      const titleMatch = outputText.match(/Title:\s*(.+)/);
      const descriptionMatch = outputText.match(/Description:\s*(.+)/);
      const ingredientsMatch = outputText.match(
        /Ingredients:\n([\s\S]*?)\n\nInstructions:/
      );
      const instructionsMatch = outputText.match(
        /Instructions:\n([\s\S]*?)\n\nprep_time/
      );
      const prepTimeMatch = outputText.match(/prep_time in minutes:\s*(\d+)/);
      const cookTimeMatch = outputText.match(/cook_time in minutes:\s*(\d+)/);
      const servingsMatch = outputText.match(/servings:\s*(\d+)/);
      const difficultyMatch = outputText.match(/difficulty:\s*(.+)/i);
      const cuisineTypeMatch = outputText.match(/cuisine_type:\s*(.+)/i);
      const dietaryTagsMatch = outputText.match(/dietary_tags:\s*(.+)/i);

      const sampleRecipe = {
        user_id: user?.id,
        title: titleMatch?.[1]?.trim() || "",
        description: descriptionMatch?.[1]?.trim() || "",
        ingredients:
          ingredientsMatch?.[1]
            ?.split("\n")
            .map((line) => line.replace(/^[\*\-\d\.\s]+/, "").trim())
            .filter(Boolean) || [],
        instructions:
          instructionsMatch?.[1]
            ?.split("\n")
            .map((line) => line.replace(/^[\d\.\s]+/, "").trim())
            .filter(Boolean) || [],
        prep_time: Number(prepTimeMatch?.[1]) || 0,
        cook_time: Number(cookTimeMatch?.[1]) || 0,
        servings: Number(servingsMatch?.[1]) || 0,
        difficulty: difficultyMatch?.[1]?.trim().toLowerCase() || "",
        cuisine_type: cuisineTypeMatch?.[1]?.trim() || "",
        dietary_tags:
          dietaryTagsMatch?.[1]?.split(",").map((tag) => tag.trim()) || [],
        is_ai_generated: true,
      };

      const { error } = await supabase.from("recipes").insert([sampleRecipe]);

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
        setRecipePrompt("");
        fetchUserData();
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Error in generating recipe.",
      });
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
              <div className="flex gap-3 max-w-lg">
                <Input
                  placeholder="Write a recipe of Biryani..."
                  value={recipePrompt}
                  onChange={(e) => setRecipePrompt(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
                <Button
                  variant="hero"
                  size="hero"
                  onClick={generateAIRecipe}
                  className="shrink-0"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Recipe
                </Button>
              </div>
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
              <Button variant="outline" onClick={() => setShowAddForm(true)}>
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
                    Start by generating your first AI recipe or adding one
                    manually
                  </p>
                  <Button onClick={generateAIRecipe}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Your First Recipe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="hover:shadow-warm transition-shadow relative group"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg leading-6 pr-2">
                            {recipe.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                              {recipe.is_ai_generated
                                ? "AI Generated"
                                : "Added Recipe"}
                            </div>
                            {!recipe.is_public && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Share Recipe
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to make this recipe
                                      public? Other users will be able to see it
                                      in the Discover tab.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        shareRecipe(recipe.id);
                                      }}
                                    >
                                      Yes, Make Public
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {/*comments*/}
                            {recipe.is_public && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <Share2 className="w-3 h-3" />
                                <span>Public</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-justify">{recipe.description}</CardDescription>
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
                          <div className="capitalize">{recipe.difficulty}</div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6 " >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Discover New Recipes
                </h3>
                <p className="text-muted-foreground">
                  Explore recipes shared by the community
                </p>
              </div>
              <Button variant="outline" onClick={fetchPublicRecipes}>
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {discoverLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground ml-4">
                  Loading public recipes...
                </p>
              </div>
            ) : publicRecipes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-semibold mb-2">
                    No public recipes yet
                  </h4>
                  <p className="text-muted-foreground text-center mb-4">
                    Be the first to share a recipe with the community! Go to "My
                    Recipes" and click the share button on any recipe.
                  </p>
                  <Button onClick={() => fetchPublicRecipes()}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Check Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="hover:shadow-warm transition-shadow cursor-pointer"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-6">
                          {recipe.title}
                        </CardTitle>
                        <div className="flex flex-col items-end gap-1">
                          <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                            {recipe.is_ai_generated
                              ? "AI Generated"
                              : "Community Recipe"}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>
                              by{" "}
                              {(recipe as any).profiles?.full_name ||
                                "Anonymous"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-justify">{recipe.description}</CardDescription>
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
                        <div className="capitalize">{recipe.difficulty}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Beautiful Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Recipe Magic</h3>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Discover, create, and share amazing recipes with the power of
                AI. Your culinary journey starts here.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://mail.google.com/mail/?view=cm&to=mustafa25008c@gmail.com&subject=Hello&body=I'd love to connect"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </a>
                <a href="https://github.com/Mustafa25008/internship.git" target="_blank" rel="noopener noreferrer">
                  <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                </a>
                
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    My Recipes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Discover
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Add Recipe
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    AI Generator
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Recipe Magic.
              <span className="animate-pulse"> All Right Reversed.</span>
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="text-xs text-muted-foreground">
                Powered by AI
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>

      {/* Add Recipe Form Modal */}
      {showAddForm && (
        <AddRecipeForm
          onClose={() => setShowAddForm(false)}
          onRecipeAdded={fetchUserData}
        />
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
