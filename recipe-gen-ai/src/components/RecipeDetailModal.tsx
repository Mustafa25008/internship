import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat } from 'lucide-react';

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
  created_at: string;
}

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeDetailModal({ recipe, isOpen, onClose }: RecipeDetailModalProps) {
  if (!recipe) return null;

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between margin-right-4 bg-background p-4 rounded-lg shadow-sm">
            <div>
              <DialogTitle className="text-2xl font-bold mb-2">{recipe.title}</DialogTitle>
              <p className="text-muted-foreground">{recipe.description}</p>
            </div>
            <Badge className='min-w-[110px] px-2 py-1'
            variant={recipe.is_ai_generated ? "default" : "secondary"}>
              {recipe.is_ai_generated ? 'AI Generated me' : 'Added Recipe'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Stats */}
          <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">{totalTime}m</span> total
                {recipe.prep_time && recipe.cook_time && (
                  <span className="text-muted-foreground ml-1">
                    ({recipe.prep_time}m prep + {recipe.cook_time}m cook)
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium capitalize">{recipe.difficulty}</span>
            </div>
          </div>

          {/* Tags */}
          {(recipe.cuisine_type || recipe.dietary_tags?.length) && (
            <div className="flex flex-wrap gap-2">
              {recipe.cuisine_type && (
                <Badge variant="outline">{recipe.cuisine_type}</Badge>
              )}
              {recipe.dietary_tags?.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}