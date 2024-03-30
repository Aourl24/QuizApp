from django.core.management.base import BaseCommand
from question.models import Question, Category, Level,Option
import requests


'''[{'type': 'multiple', 'difficulty': 'normal', 'category': 'Python', 'question': 'What is the capital of Indonesia?', 'correct_answer': 'Jakarta', 'incorrect_answers': ['Bandung', 'Medan', 'Palembang']}]'''
url = 'https://opentdb.com/api.php?amount=20&category=18'
questions = [
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of inserting an element into the middle of an array (assuming sufficient space)?', 
     'correct_answer': 'O(n)', 
     'incorrect_answers': ['O(1)', 'O(log n)', 'O(n^2)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'Which data structure uses the Last In First Out (LIFO) principle?', 
     'correct_answer': 'Stack', 
     'incorrect_answers': ['Queue', 'Array', 'LinkedList']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of an algorithm?', 
     'correct_answer': 'Amount of memory used by an algorithm', 
     'incorrect_answers': ['Amount of time taken by an algorithm', 'Number of operations performed by an algorithm', 'Number of comparisons made by an algorithm']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'Which of the following is not a stable sorting algorithm?', 
     'correct_answer': 'Quicksort', 
     'incorrect_answers': ['Bubble sort', 'Insertion sort', 'Merge sort']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of finding an element in a binary search tree (BST) in the worst case?', 
     'correct_answer': 'O(n)', 
     'incorrect_answers': ['O(log n)', 'O(n log n)', 'O(1)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What data structure is used for breadth-first search (BFS)?', 
     'correct_answer': 'Queue', 
     'incorrect_answers': ['Stack', 'LinkedList', 'Array']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of bubble sort?', 
     'correct_answer': 'O(n^2)', 
     'incorrect_answers': ['O(n log n)', 'O(n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'Which sorting algorithm is known for its best-case time complexity of O(n log n)?', 
     'correct_answer': 'Merge sort', 
     'incorrect_answers': ['Quicksort', 'Bubble sort', 'Insertion sort']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the quicksort algorithm in the worst case?', 
     'correct_answer': 'O(n^2)', 
     'incorrect_answers': ['O(n)', 'O(n log n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of a recursive algorithm?', 
     'correct_answer': 'O(n)', 
     'incorrect_answers': ['O(1)', 'O(n log n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'Which data structure uses the First In First Out (FIFO) principle?', 
     'correct_answer': 'Queue', 
     'incorrect_answers': ['Stack', 'LinkedList', 'Array']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the binary search algorithm?', 
     'correct_answer': 'O(log n)', 
     'incorrect_answers': ['O(n)', 'O(n log n)', 'O(1)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'Which of the following is not a comparison-based sorting algorithm?', 
     'correct_answer': 'Counting sort', 
     'incorrect_answers': ['Bubble sort', 'Merge sort', 'Quicksort']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the insertion sort algorithm?', 
     'correct_answer': 'O(n^2)', 
     'incorrect_answers': ['O(n)', 'O(n log n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of the binary search algorithm?', 
     'correct_answer': 'O(1)', 
     'incorrect_answers': ['O(n)', 'O(n log n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the purpose of dynamic programming?', 
     'correct_answer': 'To solve problems by breaking them down into smaller subproblems and storing their solutions', 
     'incorrect_answers': ['To find the shortest path in a graph', 'To find the maximum flow in a network', 'To solve systems of linear equations']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the selection sort algorithm?', 
     'correct_answer': 'O(n^2)', 
     'incorrect_answers': ['O(n)', 'O(n log n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of the selection sort algorithm?', 
     'correct_answer': 'O(1)', 
     'incorrect_answers': ['O(n)', 'O(n log n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'Which data structure is used for depth-first search (DFS)?', 
     'correct_answer': 'Stack', 
     'incorrect_answers': ['Queue', 'Array', 'LinkedList']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of the merge sort algorithm?', 
     'correct_answer': 'O(n)', 
     'incorrect_answers': ['O(1)', 'O(n log n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the merge sort algorithm?', 
     'correct_answer': 'O(n log n)', 
     'incorrect_answers': ['O(n)', 'O(n^2)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of the quicksort algorithm?', 
     'correct_answer': 'O(log n)', 
     'incorrect_answers': ['O(1)', 'O(n)', 'O(n^2)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the purpose of a hash table?', 
     'correct_answer': 'To store key-value pairs and provide fast access to values based on keys', 
     'incorrect_answers': ['To sort elements in a list', 'To find the shortest path in a graph', 'To represent hierarchical data']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the linear search algorithm?', 
     'correct_answer': 'O(n)', 
     'incorrect_answers': ['O(log n)', 'O(n log n)', 'O(1)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the radix sort algorithm?', 
     'correct_answer': 'O(nk)', 
     'incorrect_answers': ['O(n^2)', 'O(n log n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of the radix sort algorithm?', 
     'correct_answer': 'O(n+k)', 
     'incorrect_answers': ['O(1)', 'O(n)', 'O(log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the purpose of a heap data structure?', 
     'correct_answer': 'To efficiently find and remove the maximum (or minimum) element from a collection', 
     'incorrect_answers': ['To store key-value pairs and provide fast access to values based on keys', 'To sort elements in a list', 'To represent hierarchical data']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of the binary search tree (BST) data structure?', 
     'correct_answer': 'O(n)', 
     'incorrect_answers': ['O(1)', 'O(log n)', 'O(n log n)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the breadth-first search (BFS) algorithm?', 
     'correct_answer': 'O(V + E)', 
     'incorrect_answers': ['O(log V)', 'O(E log V)', 'O(V^2)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of the breadth-first search (BFS) algorithm?', 
     'correct_answer': 'O(V)', 
     'incorrect_answers': ['O(E)', 'O(V + E)', 'O(V^2)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the time complexity of the depth-first search (DFS) algorithm?', 
     'correct_answer': 'O(V + E)', 
     'incorrect_answers': ['O(log V)', 'O(E log V)', 'O(V^2)']
    },
    {'type': 'multiple', 'difficulty': 'medium', 'category': 'Data Structures & Algorithms', 
     'question': 'What is the space complexity of the depth-first search (DFS) algorithm?', 
     'correct_answer': 'O(V)', 
     'incorrect_answers': ['O(E)', 'O(V + E)', 'O(V^2)']
    }
]


class Command(BaseCommand):
	help = "Generate api"

	def handle(self,*args,**options):
		print('working on api')
		#data = requests.get(url)
		#response = data.json()
		for res in questions:#['results']:
			try:
				category = Category.objects.get(name=res['category'])
			except Category.DoesNotExist:
				category = Category.objects.create(name=res['category'])

			try:
				level = Level.objects.get(name=res['difficulty'])
			except Level.DoesNotExist:
				level = Level.objects.create(name=res['difficulty'])

			question = Question.objects.create(category=category,level=level,body=res['question'])

			correct_option = Option.objects.create(question=question,body=res['correct_answer'],answer=True)
			for opt in res['incorrect_answers']:
				option = Option.objects.create(question=question,body=opt,answer=False)

			print('done')

		