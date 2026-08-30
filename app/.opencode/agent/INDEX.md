# Subagents Available in This Project

This directory contains specialized subagents that can be invoked for specific tasks.

## Available Subagents

### image
Creates and generates images (illustrations, mockups, diagrams, graphics) using the gemini vision model. Use whenever an image needs to be created, generated, or produced and the main text model cannot create it.

**Model:** antseed/gemini-3-1-pro-preview  
**Permissions:** read, edit  
**Usage:** When you need to generate new images, create mockups, or produce graphics

### vision
Inspects and interprets image files (screenshots, mockups, diagrams) using the gemini vision model. Use whenever an image needs to be analyzed, described, or reviewed and the main text model cannot see it.

**Model:** antseed/gemini-2.5-flash  
**Permissions:** read, deny edit  
**Usage:** When you need to analyze screenshots, review designs, or understand visual content

## Usage

When a task requires vision or image capabilities, invoke the appropriate subagent:
- For **creating** images: use `image` subagent
- For **analyzing** images: use `vision` subagent

These subagents can be invoked automatically by the system when the task matches their description.
