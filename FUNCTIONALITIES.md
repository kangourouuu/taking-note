#  Context
 
## User story

As a user, I want to have a dashboard with the primary calendar which is displayed as monthly. Each day in calendar can have notes. These notes can be created, edited, deleted, and viewed. I can create the project / category. Inside each project, I can add tags, and notes. 

## User flow
### Login

1. User will login with username & password
2. The authentication using JWT token

### Project modification

1. User must create at least one project first
2. User can see the dashboard with project & month filtering
3. User can add tags inside the project

### Notes modification

1. User will see the big calendar in dashboard
2. User can click a day in the calendar
3. User inputs a note in that day
4. User can see the note in the calendar as the chip

### Tags modification

1. User can create, edit, delete, and view tags at user-level with the color, title
2. User can add the tag in each notes
3. User can filter the dashboard by tags and project

## Constraints

- User must login first for each actions
- The calendar displays with correct applied filters (project and tags)
- The dashboard won't be affected
- The chip of each note will stay stably, filter just hide the irrelevant chip

## ACs

- User can login successfully
- User can modify the note or create the new one
- User can see this note as substitle summary as the chip inside each day
- User can click the chip to see the note in the separate page or modifying it
- Each note can be tagged with tags
- User can create, edit, delete, and view tags
- User can search notes by tags
- User can create the project
