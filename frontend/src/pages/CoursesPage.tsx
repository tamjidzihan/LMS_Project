import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { courseService } from '@/lib/api';
import { Course } from '@/lib/types';
import { SearchIcon, SlidersHorizontal, Star } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const CoursesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch courses with filters
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', searchTerm, category, level, maxPrice, currentPage],
    queryFn: () => courseService.getAllCourses({
      page: currentPage,
      search: searchTerm,
      category,
      level,
      max_price: maxPrice > 0 ? maxPrice : undefined,
    }),
  });

  // Categories for filter
  const categories = [
    { id: 'development', name: 'Development' },
    { id: 'business', name: 'Business' },
    { id: 'design', name: 'Design' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'personal-development', name: 'Personal Development' },
  ];

  // Levels for filter
  const levels = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setCategory('');
    setLevel('');
    setMaxPrice(100);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (!coursesData) return null;
    
    const totalPages = Math.ceil(coursesData.count / 12);
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex justify-center mt-8">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </Button>
          
          {startPage > 1 && (
            <>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(1)}
              >
                1
              </Button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}
          
          {pageNumbers.map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(number)}
            >
              {number}
            </Button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="w-full md:w-64 hidden md:block">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Category</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="all-categories" 
                    checked={category === ''} 
                    onCheckedChange={() => {
                      setCategory('');
                      handleFilterChange();
                    }} 
                  />
                  <Label htmlFor="all-categories">All Categories</Label>
                </div>
                
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${cat.id}`} 
                      checked={category === cat.id}
                      onCheckedChange={() => {
                        setCategory(cat.id);
                        handleFilterChange();
                      }}
                    />
                    <Label htmlFor={`category-${cat.id}`}>{cat.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Level</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="all-levels" 
                    checked={level === ''} 
                    onCheckedChange={() => {
                      setLevel('');
                      handleFilterChange();
                    }} 
                  />
                  <Label htmlFor="all-levels">All Levels</Label>
                </div>
                
                {levels.map((lvl) => (
                  <div key={lvl.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`level-${lvl.id}`} 
                      checked={level === lvl.id}
                      onCheckedChange={() => {
                        setLevel(lvl.id);
                        handleFilterChange();
                      }}
                    />
                    <Label htmlFor={`level-${lvl.id}`}>{lvl.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Price</h3>
              <div className="space-y-4">
                <Slider
                  value={[maxPrice]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => {
                    setMaxPrice(value[0]);
                    handleFilterChange();
                  }}
                />
                <div className="flex justify-between text-sm">
                  <span>Free</span>
                  <span>${maxPrice}</span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        {/* Mobile Filters */}
        <div className="md:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow down courses to find exactly what you're looking for
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mobile-all-categories" 
                        checked={category === ''} 
                        onCheckedChange={() => {
                          setCategory('');
                          handleFilterChange();
                        }} 
                      />
                      <Label htmlFor="mobile-all-categories">All Categories</Label>
                    </div>
                    
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`mobile-category-${cat.id}`} 
                          checked={category === cat.id}
                          onCheckedChange={() => {
                            setCategory(cat.id);
                            handleFilterChange();
                          }}
                        />
                        <Label htmlFor={`mobile-category-${cat.id}`}>{cat.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Level</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mobile-all-levels" 
                        checked={level === ''} 
                        onCheckedChange={() => {
                          setLevel('');
                          handleFilterChange();
                        }} 
                      />
                      <Label htmlFor="mobile-all-levels">All Levels</Label>
                    </div>
                    
                    {levels.map((lvl) => (
                      <div key={lvl.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`mobile-level-${lvl.id}`} 
                          checked={level === lvl.id}
                          onCheckedChange={() => {
                            setLevel(lvl.id);
                            handleFilterChange();
                          }}
                        />
                        <Label htmlFor={`mobile-level-${lvl.id}`}>{lvl.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Price</h3>
                  <div className="space-y-4">
                    <Slider
                      value={[maxPrice]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) => {
                        setMaxPrice(value[0]);
                        handleFilterChange();
                      }}
                    />
                    <div className="flex justify-between text-sm">
                      <span>Free</span>
                      <span>${maxPrice}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => document.querySelector<HTMLButtonElement>('button[aria-label="close"]')?.click()}
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      clearFilters();
                      document.querySelector<HTMLButtonElement>('button[aria-label="close"]')?.click();
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Courses List */}
        <div className="flex-1">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="search"
                placeholder="Search for courses"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          {/* Sort */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              {coursesData ? `Showing ${coursesData.results.length} of ${coursesData.count} courses` : 'Loading courses...'}
            </p>
            
            <Select defaultValue="relevance">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="highest-rated">Highest Rated</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(9).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 rounded-t-lg" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6 mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : coursesData?.results.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters or search term</p>
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesData?.results.map((course: Course) => (
                  <Link to={`/courses/${course.id}`} key={course.id} className="group">
                    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {course.image ? (
                          <img
                            src={course.image}
                            alt={course.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-muted">
                            <span className="text-4xl">📚</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {course.short_description || course.description.substring(0, 100)}
                        </p>
                        {course.instructor && (
                          <p className="text-xs text-muted-foreground">
                            {course.instructor.first_name} {course.instructor.last_name}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
                        </div>
                        <span className="font-semibold">
                          {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;