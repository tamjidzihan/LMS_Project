from rest_framework import serializers
from .models import Course, Lesson, Category, Review
from users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""

    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for Lesson model"""

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'content',
                  'video_url', 'duration', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'course', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for listing courses"""
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'instructor', 'category',
                  'price', 'discount_price', 'image', 'created_at', 'average_rating', 'lessons_count']

    def get_average_rating(self, obj):
        return obj.get_average_rating()

    def get_lessons_count(self, obj):
        return obj.lessons.count()


class CourseDetailSerializer(serializers.ModelSerializer):
    """Serializer for course details"""
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'instructor', 'category', 'price',
                  'discount_price', 'image', 'created_at', 'updated_at', 'is_published',
                  'lessons', 'reviews', 'average_rating']

    def get_average_rating(self, obj):
        return obj.get_average_rating()


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating courses"""

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'category', 'price',
                  'discount_price', 'image', 'is_published']

    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)
