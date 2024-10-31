from django.contrib import admin
from  .models import *

class OptionAdmin(admin.StackedInline):
	model = Option
	min_num = 4
	max_num = 4
	extra = 4


class QuestionAdmin(admin.ModelAdmin):
	inlines = [OptionAdmin]



admin.site.register(Question,QuestionAdmin)
admin.site.register([Level,Game,Player,Category,Option,Profile])
      
