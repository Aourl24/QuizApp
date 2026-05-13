import re
import os


def parse_md_exam(filepath):
    """
    Parse a Markdown exam file into structured question data.
    Returns list of dicts ready for your Question/Option models.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = []
    
    # Split by numbered question lines
    # Pattern: number followed by period at start of line
    blocks = re.split(r'\n(?=\d+\.\s)', content)
    
    for block in blocks:
        block = block.strip()
        if not block or not re.match(r'^\d+\.', block):
            continue
        
        # Extract question body (everything after number until first option)
        q_match = re.match(r'^\d+\.\s*(.*?)(?=\n\s*-\s+[A-E]\.)', block, re.DOTALL)
        if not q_match:
            continue
        
        body = ' '.join(q_match.group(1).split())  # Clean whitespace
        
        # Extract options
        options = []
        opt_pattern = r'^\s*-\s+([A-E])\.\s+(.*?)(?=\n\s*-\s+[A-E]\.|\n\s*<details|\Z)'
        
        for match in re.finditer(opt_pattern, block, re.MULTILINE | re.DOTALL):
            letter = match.group(1)
            text = match.group(2).strip()
            text = ' '.join(text.split())  # Clean whitespace
            options.append({
                'letter': letter,
                'body': f"{letter}. {text}"
            })
        
        # Extract correct answer(s)
        answer_match = re.search(
            r'<details.*?>\s*<summary.*?>Answer.*?</summary>\s*Correct answer:\s*([A-E](?:,\s*[A-E])*)',
            block,
            re.DOTALL | re.IGNORECASE
        )
        
        correct_letters = []
        if answer_match:
            correct_letters = [l.strip().upper() for l in answer_match.group(1).split(',')]
        
        # Mark correct options
        for opt in options:
            opt['answer'] = opt['letter'] in correct_letters
        
        questions.append({
            'body': body,
            'options': options,
            'is_multiple': len(correct_letters) > 1
        })
    
    # Extract title from first # heading
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else 'Untitled Exam'
    
    return {
        'title': title,
        'questions': questions
    }
