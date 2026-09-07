import httpx
import sys
BASE='http://127.0.0.1:8000'
client = httpx.Client()
print('Seeding Ohm\'s Law demo...')
r = client.post(f'{BASE}/api/demo/reset-ohms-law')
print('seed status', r.status_code)

print('Logging in demo user...')
r = client.post(f'{BASE}/api/auth/login', json={'email':'student@eduvatar.ai','password':'password123'})
if r.status_code!=200:
    print('login failed', r.status_code, r.text); sys.exit(1)
token = r.json()['access_token']
headers={'Authorization':f'Bearer {token}'}
print('token acquired')

print('Listing lessons...')
r = client.get(f'{BASE}/api/lessons', headers=headers)
print('lessons status', r.status_code)
lessons = r.json()
if not lessons:
    print('no lessons found'); sys.exit(1)
lesson = lessons[0]
print('Using lesson:', lesson['title'], 'id=', lesson['id'])
lesson_id = lesson['id']

print('Fetching lesson detail...')
r = client.get(f'{BASE}/api/lessons/{lesson_id}', headers=headers)
print('detail status', r.status_code)
lesson_detail = r.json()
sections = lesson_detail['sections']
print('Sections count:', len(sections))

# Start: Iterate sections, submit correct answer for section 0, wrong for section 1 to test misconception
for idx, sec in enumerate(sections):
    print('\n--- Section', idx, sec['title'])
    # Select concept
    sel = client.post(f'{BASE}/api/lessons/{lesson_id}/select-concept/{idx}', headers=headers)
    print('select status', sel.status_code)
    # find a question for this section
    qs = [q for q in lesson_detail['questions'] if q.get('section_id')==sec['id']]
    if not qs:
        # fallback: query questions by getting lesson detail again
        lesson_detail = client.get(f'{BASE}/api/lessons/{lesson_id}', headers=headers).json()
        qs = [q for q in lesson_detail['questions'] if q.get('section_id')==sec['id']]
    print('questions for section:', len(qs))
    if not qs:
        continue
    q = qs[0]
    print('Question:', q['question_text'])
    # decide answer: correct for first section, wrong for second, correct for third
    if idx==1:
        ans = 'A' if q.get('options') else 'wrong'
    else:
        ans = q.get('correct_answer') or (q.get('options')[0]['id'] if q.get('options') else '4')
    payload = {
        'lesson_id': lesson_id,
        'question_id': q['id'],
        'student_answer': ans,
        'response_time_seconds': 5.0,
        'confidence': 0.8
    }
    resp = client.post(f'{BASE}/api/teaching/respond', json=payload, headers=headers)
    print('response status', resp.status_code)
    if resp.status_code==200:
        print('feedback:', resp.json())
    else:
        print('error:', resp.text)

# Final lesson state
final = client.get(f'{BASE}/api/lessons/{lesson_id}', headers=headers).json()
print('\nFinal lesson status:', final['status'])
print('Curriculum summary:', final.get('curriculum_summary'))
print('Completed sections statuses:')
for s in final['sections']:
    print(s['section_index'], s['title'], s['status'])

print('\nE2E script finished')
