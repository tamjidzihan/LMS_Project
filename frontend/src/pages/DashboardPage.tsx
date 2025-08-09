import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { enrollmentService, courseService } from '@/lib/api';
import { BookOpen, Award, Clock, BarChart3, PlusCircle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-courses');

  // Fetch user enrollments
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['userEnrollments'],
    queryFn: () => enrollmentService.getUserEnrollments(),
  });

  // Fetch instructor courses if user is an instructor
  const { data: instructorCourses, isLoading: isInstructorCoursesLoading } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: () => courseService.getInstructorCourses(),
    enabled: user?.role === 'instructor',
  });

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.first_name}!
          </p>
        </div>

        {user?.role === 'instructor' && (
          <Button onClick={() => navigate('/courses/create')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        )}
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Enrolled Courses</p>
              <h3 className="text-2xl font-bold mt-1">
                {isEnrollmentsLoading ? <Skeleton className="h-8 w-12" /> : enrollments?.length || 0}
              </h3>
            </div>
            <BookOpen className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Completed</p>
              <h3 className="text-2xl font-bold mt-1">
                {isEnrollmentsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  enrollments?.filter(e => e.progress === 100).length || 0
                )}
              </h3>
            </div>
            <Award className="h-8 w-8 text-green-500 opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Hours Learned</p>
              <h3 className="text-2xl font-bold mt-1">
                {isEnrollmentsLoading ? <Skeleton className="h-8 w-12" /> : '12.5'}
              </h3>
            </div>
            <Clock className="h-8 w-8 text-blue-500 opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Avg. Progress</p>
              <h3 className="text-2xl font-bold mt-1">
                {isEnrollmentsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  `${enrollments && enrollments.length > 0
                    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
                    : 0}%`
                )}
              </h3>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-500 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        defaultValue="my-courses"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          {user?.role === 'instructor' && (
            <TabsTrigger value="teaching">Teaching</TabsTrigger>
          )}
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* My Courses Tab */}
        <TabsContent value="my-courses" className="space-y-4">
          {isEnrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <div className="flex flex-col md:flex-row">
                    <Skeleton className="h-48 w-full md:w-48 rounded-l-lg" />
                    <div className="p-6 flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-2 w-full mb-4" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-48 h-48 md:h-auto bg-muted relative overflow-hidden">
                      {enrollment.course_details?.image ? (
                        <img
                          src={enrollment.course_details.image}
                          alt={enrollment.course_details.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {enrollment.course_details?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Enrolled on {formatDate(enrollment.created_at)}
                        </p>
                        <div className="flex items-center space-x-2 mb-4">
                          <Progress value={enrollment.progress} className="h-2" />
                          <span className="text-xs font-medium">{enrollment.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <Button 
                          variant="default" 
                          size="sm"
                          asChild
                          className="mt-2"
                        >
                          <Link to={`/courses/${enrollment.course}/learn`}>
                            {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Explore our catalog and enroll in your first course
                </p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Teaching Tab (for instructors) */}
        {user?.role === 'instructor' && (
          <TabsContent value="teaching" className="space-y-4">
            {isInstructorCoursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <div className="flex flex-col md:flex-row">
                      <Skeleton className="h-48 w-full md:w-48 rounded-l-lg" />
                      <div className="p-6 flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-2 w-full mb-4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-24" />
                          <Skeleton className="h-9 w-24" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : instructorCourses && instructorCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {instructorCourses.map((course) => (
                  <Card key={course.id}>
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="md:w-48 h-48 md:h-auto bg-muted relative overflow-hidden">
                        {course.image ? (
                          <img
                            src={course.image}
                            alt={course.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Students: {course.enrollment_count || 0}</span>
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span>{course.average_rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Last updated: {formatDate(course.last_updated)}
                          </p>
                        </div>
                        
                        <div className="mt-auto flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                          >
                            <Link to={`/courses/${course.id}`}>
                              View Course
                            </Link>
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            asChild
                          >
                            <Link to={`/courses/${course.id}/edit`}>
                              Edit Course
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No courses created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start creating your first course to share your knowledge
                  </p>
                  <Button onClick={() => navigate('/courses/create')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Course
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Certificates</CardTitle>
              <CardDescription>
                View and download certificates for completed courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEnrollmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  ))}
                </div>
              ) : enrollments?.filter(e => e.progress === 100).length > 0 ? (
                <div className="space-y-4">
                  {enrollments
                    .filter(e => e.progress === 100)
                    .map((enrollment) => (
                      <div 
                        key={enrollment.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md"
                      >
                        <div className="space-y-1">
                          <h4 className="font-medium">{enrollment.course_details?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Completed on {formatDate(enrollment.last_accessed || enrollment.created_at)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 sm:mt-0">
                          <Award className="mr-2 h-4 w-4" />
                          View Certificate
                        </Button>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No certificates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete courses to earn certificates
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/courses">Continue Learning</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;