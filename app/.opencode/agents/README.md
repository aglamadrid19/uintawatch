# OpenAgents Reference Guide

This directory contains specialized subagents that can be invoked for specific tasks.

## Available Subagents

### image
Creates and generates images (illustrations, mockups, diagrams, graphics) using the gemini vision model. Use whenever an image needs to be created, generated, or produced and the main text model cannot create it.

**Model:** gemini-3.1-pro-preview  
**Permissions:** read, edit  
**Usage:** When you need to generate new images, create mockups, or produce graphics

### vision
Inspects and interprets image files (screenshots, mockups, diagrams) using the gemini vision model. Use whenever an image needs to be analyzed, described, or reviewed and the main text model cannot see it.

**Model:** gemini-3.1-pro-preview  
**Permissions:** read, deny edit  
**Usage:** When you need to analyze screenshots, review designs, or understand visual content

### ui-reviewer
Same functionality as the vision subagent - inspects and interprets image files using the gemini vision model.

**Model:** gemini-3.1-pro-preview  
**Permissions:** read, deny edit  
**Usage:** When you need to analyze screenshots, review designs, or understand visual content

## Usage Guidelines

### Invocation Pattern
Subagents can be invoked in several ways:

1. **By description**: The system automatically routes tasks to the appropriate subagent based on the description matching
2. **By @mention**: You can manually invoke a subagent by @mentioning it in your messages
3. **For vision tasks**: When analyzing images, the vision subagent will automatically be selected
4. **For image creation**: When generating images, the image subagent will automatically be selected

### Task Selection

**Use the image subagent when:**
- Creating illustrations for app flows
- Generating UI mockups for design reviews
- Making diagram/flowchart visualizations
- Producing any graphics or visual content
- Designing brand assets or mockups

**Use the vision subagent when:**
- Reviewing screenshots from your app or competitors
- Analyzing UI designs and layouts
- Understanding visual layouts from screenshots
- Describing image content in detail
- Providing visual analysis or feedback

**Use the ui-reviewer subagent when:**
- Same use cases as vision subagent
- Formal UI/UX design reviews
- Detailed visual accessibility analysis
- UI consistency audits

### Request Examples

```
@image create a UI mockup for the login screen

@vision analyze this screenshot of the home screen design

@ui-reviewer review the mockup I've uploaded

@image generate a flowchart for the user registration process
```

These subagents utilize specialized models tuned for their respective tasks:
- **Image generation** uses gemini-3.1-pro-preview (better for creation tasks)
- **Vision analysis** uses gemini-3.1-pro-preview (faster for analysis tasks)

## Integration with Skills

These subagents integrate with your project's skills to provide enhanced capabilities:

- **Mobile App UI/Design Skill**: Can use image subagent for creating design mockups
- **Expo Animations Skill**: Can use vision subagent to analyze animation states
- **All other project skills**: Subagents can handle vision and image needs as appropriate

## Best Practices

1. **Be specific about output format**: When requesting images, specify requirements (mockup size, resolution, format)
2. **Provide context**: Give sufficient context for vision tasks about what you're looking for in the image
3. **Use appropriate subagent**: Choose image for creation, vision/ui-reviewer for analysis
4. **Reference paths**: When providing images to analyze, include full paths if known

## Architecture

Subagents follow OpenCode's standard agent configuration:
- **mode: subagent**: Can be invoked by primary agents or manually
- **model override**: Each subagent uses task-specific models
- **permission boundaries**: Read access is enabled appropriately; edit access is restricted for vision subagents
- **Self-contained instructions**: Each subagent has clear, focused objectives
