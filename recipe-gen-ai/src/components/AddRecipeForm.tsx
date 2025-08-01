import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

interface AddRecipeFormProps {
  onClose: () => void;
  onRecipeAdded: () => void;
}

export function AddRecipeForm({ onClose, onRecipeAdded }: AddRecipeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prepTime: '',
    cookTime: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Parse ingredients and instructions into arrays
      const ingredientsArray = formData.ingredients
        .split('\n')
        .filter(item => item.trim())
        .map(item => item.trim());

      const instructionsArray = formData.instructions
        .split('\n')
        .filter(item => item.trim())
        .map(item => item.trim());

      const recipe = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        ingredients: ingredientsArray,
        instructions: instructionsArray,
        prep_time: formData.prepTime ? parseInt(formData.prepTime) : null,
        cook_time: formData.cookTime ? parseInt(formData.cookTime) : null,
        servings: 4, // Default servings
        difficulty: 'medium', // Default difficulty
        is_ai_generated: false
      };

      const { error } = await supabase
        .from('recipes')
        .insert([recipe]);

      if (error) {
        toast({
          title: "Error adding recipe",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recipe added!",
          description: "Your recipe has been successfully added.",
        });
        onRecipeAdded();
        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to add recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Recipe</CardTitle>
              <CardDescription>Create your own recipe to add to your collection</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Recipe Title/Name</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter recipe name..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of your recipe..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => handleChange('prepTime', e.target.value)}
                  placeholder="15"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) => handleChange('cookTime', e.target.value)}
                  placeholder="30"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) => handleChange('ingredients', e.target.value)}
                placeholder="Enter each ingredient on a new line:&#10;2 cups flour&#10;1 cup sugar&#10;3 eggs"
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="Enter each instruction step on a new line:&#10;Mix flour and sugar&#10;Add eggs one at a time&#10;Bake for 30 minutes"
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.ingredients || !formData.instructions}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add Recipe'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}