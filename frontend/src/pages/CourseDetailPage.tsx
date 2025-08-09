import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { courseService, enrollmentService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Book, Users, CalendarDays, Star, CheckCircle2 } from 'lucide-react';

interface CourseParams {
  id?: string;
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<CourseParams>();
  const courseId = id || '';
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  // Fetch course details
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !!courseId,
  });

  // Check if user is enrolled
  const { data: userEnrollments, isLoading: isEnrollmentLoading } = useQuery({
    queryKey: ['userEnrollments', user?.id],
    queryFn: () => enrollmentService.getUserEnrollments(),
    enabled: isAuthenticated && !!user?.id,
  });

  const isEnrolled = React.useMemo(() => {
    if (!userEnrollments || !course) return false;
    return userEnrollments.some((enrollment) => enrollment.course === parseInt(courseId));
  }, [userEnrollments, course, courseId]);

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: () => enrollmentService.enrollInCourse(parseInt(courseId)),
    onSuccess: () => {
      toast.success('Successfully enrolled in the course');
      queryClient.invalidateQueries({ queryKey: ['userEnrollments'] });
      setIsEnrollDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error('Failed to enroll in course');
      console.error('Enrollment error:', error);
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }
    
    if (course?.price === 0) {
      // Free course, enroll directly
      enrollMutation.mutate();
    } else {
      // Paid course, show dialog
      setIsEnrollDialogOpen(true);
    }
  };

  const confirmEnrollment = () => {
    enrollMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-10">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <p className="text-muted-foreground mt-2">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses">
            <Button className="mt-4">Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-2">{course.short_description || course.description.substring(0, 150) + '...'}</p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            {course.instructor && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground">Instructor:</span>
                <span className="ml-1 font-medium">{course.instructor.first_name} {course.instructor.last_name}</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>{course.average_rating.toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">({course.total_ratings} ratings)</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{course.enrollment_count} students</span>
            </div>
            <div className="flex items-center text-sm">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>Last updated {new Date(course.last_updated).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-8">
            {course.image ? (
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-auto rounded-lg object-cover" 
                style={{ maxHeight: '400px' }}
              />
            ) : (
              <div className="w-full bg-muted flex items-center justify-center rounded-lg" style={{ height: '300px' }}>
                <Book className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="mt-8">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-medium mb-3">About This Course</h3>
                  <div dangerouslySetInnerHTML={{ __html: course.description }} />
                  
                  {course.what_will_learn && (
                    <div className="mt-6">
                      <h3 className="text-xl font-medium mb-3">What You'll Learn</h3>
                      <ul className="space-y-2">
                        {course.what_will_learn.split('\n').map((item, index) => (
                          item.trim() && (
                            <li key={index} className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{item.trim()}</span>
                            </li>
                          )
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="curriculum" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-xl font-medium">Course Content</h3>
                  {course.lessons && course.lessons.length > 0 ? (
                    <div className="space-y-3">
                      {course.lessons.map((lesson) => (
                        <Card key={lesson.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{lesson.title}</h4>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{lesson.duration} min</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No lessons available for this course yet.</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="instructor" className="mt-4">
                {course.instructor ? (
                  <div>
                    <h3 className="text-xl font-medium mb-3">About the Instructor</h3>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted overflow-hidden">
                        {course.instructor.profile_picture ? (
                          <img
                            src={course.instructor.profile_picture}
                            alt={`${course.instructor.first_name} ${course.instructor.last_name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-xl font-medium">
                            {course.instructor.first_name[0]}{course.instructor.last_name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{course.instructor.first_name} {course.instructor.last_name}</h4>
                        <p className="text-sm text-muted-foreground">{course.instructor.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Instructor information is not available.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {isEnrolled ? (
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/dashboard/my-courses">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Go to Course
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending || isEnrollmentLoading}
                    >
                      {enrollMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Enrolling...
                        </div>
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Lessons:</span>
                    <span>{course.lessons?.length || 0} lessons</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{course.total_duration || 0} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span className="capitalize">{course.level || 'All levels'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificate:</span>
                    <span>{course.has_certificate ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enrollment confirmation dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>You are about to enroll in <strong>{course.title}</strong> for <strong>${course.price.toFixed(2)}</strong>.</p>
            <p className="mt-2 text-muted-foreground">
              Note: This is a demo application. No actual payment will be processed.
            </p>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEnrollment} disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? 'Processing...' : 'Confirm Enrollment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;