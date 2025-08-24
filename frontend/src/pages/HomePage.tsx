import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/lib/api';
import { Course } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const HomePage: React.FC = () => {
  const { data: featuredCourses, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featuredCourses'],
    queryFn: () => courseService.getAllCourses({ page: 1 }),
    select: (data) => data.results.slice(0, 3)
  });

  const categories = [
    { id: 'development', title: 'Development', description: 'Learn programming and software development', icon: '💻' },
    { id: 'design', title: 'Design', description: 'Master digital and graphic design', icon: '🎨' },
    { id: 'business', title: 'Business', description: 'Enhance your business skills', icon: '📊' },
    { id: 'marketing', title: 'Marketing', description: 'Learn digital marketing strategies', icon: '📱' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Expand Your Knowledge with Our Courses
            </h1>
            <p className="max-w-[700px] text-base md:text-xl text-white/80">
              Access high-quality courses taught by industry experts and elevate your skills to the next level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link to="/courses">
                <Button size="lg" variant="secondary">
                  Browse Courses
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="w-full py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-3xl font-bold tracking-tighter">Featured Courses</h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[700px]">
              Discover our most popular and highly-rated courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {isFeaturedLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <Skeleton className="h-48 rounded-none" />
                  </CardHeader>
                  <CardContent className="p-6">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredCourses && featuredCourses.length > 0 ? (
              featuredCourses.map((course: Course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted relative">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <span className="text-4xl">📚</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="mb-2 line-clamp-1">{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{course.average_rating.toFixed(1)}</span>
                      </div>
                      <span className="font-medium">{parseFloat(course.price) > 0 ? `$${parseFloat(course.price).toFixed(2)}` : 'Free'}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Link to={`/courses/${course.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Course</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 text-center py-12">
                <p className="text-muted-foreground">No featured courses available at the moment.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <Link to="/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-3xl font-bold tracking-tighter">Browse Categories</h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[700px]">
              Find courses by topic to match your interests and career goals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {categories.map((category) => (
              <Link to={`/courses?category=${category.id}`} key={category.id}>
                <Card className="group hover:shadow-md transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 text-4xl">{category.icon}</div>
                    <h3 className="text-lg font-medium mb-2">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Learning?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Join thousands of students already learning on our platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg">Sign Up Now</Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline">Explore Courses</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;