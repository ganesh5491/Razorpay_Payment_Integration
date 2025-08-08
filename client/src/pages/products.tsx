import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ShoppingCart, Zap, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  description: string;
  inStock: boolean;
}

const products: Product[] = [
  {
    id: "1",
    name: "Mini Phone Holder",
    price: 8,
    originalPrice: 15,
    rating: 4.5,
    reviews: 234,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Compact and adjustable phone stand",
    inStock: true
  },
  {
    id: "2",
    name: "Cable Organizer",
    price: 5,
    originalPrice: 10,
    rating: 4.2,
    reviews: 156,
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Keep your cables neat and organized",
    inStock: true
  },
  {
    id: "3",
    name: "Bookmark Set",
    price: 3,
    rating: 4.8,
    reviews: 89,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Beautiful metal bookmarks pack of 5",
    inStock: true
  },
  {
    id: "4",
    name: "Pen Grip Set",
    price: 2,
    rating: 4.0,
    reviews: 67,
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Comfortable writing grip enhancers",
    inStock: true
  },
  {
    id: "5",
    name: "Sticky Notes Pack",
    price: 4,
    originalPrice: 7,
    rating: 4.3,
    reviews: 145,
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Colorful sticky notes for organization",
    inStock: true
  },
  {
    id: "6",
    name: "Mini LED Keychain",
    price: 6,
    rating: 4.1,
    reviews: 203,
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Bright LED light for your keys",
    inStock: true
  },
  {
    id: "7",
    name: "Rubber Band Ball",
    price: 1,
    rating: 3.9,
    reviews: 45,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Stress relief bouncy ball",
    inStock: true
  },
  {
    id: "8",
    name: "Paper Clips Set",
    price: 3,
    rating: 4.4,
    reviews: 78,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Colorful metal paper clips pack",
    inStock: true
  },
  {
    id: "9",
    name: "Mini Eraser Set",
    price: 2,
    rating: 4.6,
    reviews: 112,
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Cute animal-shaped erasers",
    inStock: true
  },
  {
    id: "10",
    name: "Magnet Set",
    price: 7,
    originalPrice: 12,
    rating: 4.7,
    reviews: 167,
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    description: "Strong neodymium magnets pack of 10",
    inStock: true
  }
];

export default function Products() {
  const [, setLocation] = useLocation();

  const handleBuyNow = (product: Product) => {
    // Store single product for direct purchase
    const orderData = {
      items: [{
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        imageUrl: product.imageUrl
      }]
    };
    sessionStorage.setItem('directPurchaseItems', JSON.stringify(orderData));
    setLocation('/shipping');
  };

  const handleAddToCart = (product: Product) => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Increase quantity if already exists
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      existingCart.push({
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        imageUrl: product.imageUrl
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show success message (you could add a toast here)
    console.log(`${product.name} added to cart`);
  };

  const goToCart = () => {
    setLocation('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Smart Shop</h1>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={goToCart}
                className="flex items-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
          <p className="text-gray-600">Discover amazing deals under ₹10</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.originalPrice && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    Sale
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                  {product.inStock && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      In Stock
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleBuyNow(product)}
                    className="w-full bg-primary text-white hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Buy Now</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}