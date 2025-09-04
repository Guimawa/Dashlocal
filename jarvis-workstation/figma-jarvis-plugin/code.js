// Figma Plugin Code for Jarvis Workstation
// This file handles the communication between Figma and the plugin UI

figma.showUI(__html__, {
  width: 400,
  height: 600,
  themeColors: true,
});

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case "generate-ui":
        await handleGenerateUI(msg.prompt);
        break;
      case "create-component":
        await handleCreateComponent(msg.componentData);
        break;
      case "resize-plugin":
        figma.ui.resize(msg.width, msg.height);
        break;
      default:
        console.log("Unknown message type:", msg.type);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    figma.ui.postMessage({
      type: "error",
      message: error.message || "An error occurred",
    });
  }
};

async function handleGenerateUI(prompt) {
  try {
    figma.ui.postMessage({
      type: "status",
      message: "Generating UI design...",
    });

    // Call the Jarvis Workstation API
    const response = await fetch("http://localhost:3000/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Generate a Figma UI design based on this description: ${prompt}. 
        Return a JSON structure describing the UI elements, their properties, and layout.
        Include: frames, rectangles, text nodes, colors, spacing, and positioning.`,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.code) {
      throw new Error("No design data returned from API");
    }

    // Parse the generated design data
    const designData = parseDesignData(data.code);

    // Create the UI elements in Figma
    const frame = await createUIElements(designData, prompt);

    // Select and focus on the created frame
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);

    figma.ui.postMessage({
      type: "success",
      message: "UI design created successfully!",
    });
  } catch (error) {
    console.error("Error generating UI:", error);
    figma.ui.postMessage({
      type: "error",
      message: error.message || "Failed to generate UI design",
    });
  }
}

async function handleCreateComponent(componentData) {
  try {
    // Create a component from the provided data
    const component = await createComponentFromData(componentData);

    figma.ui.postMessage({
      type: "success",
      message: "Component created successfully!",
    });
  } catch (error) {
    figma.ui.postMessage({
      type: "error",
      message: error.message || "Failed to create component",
    });
  }
}

function parseDesignData(code) {
  try {
    // Try to parse as JSON first
    if (code.trim().startsWith("{")) {
      return JSON.parse(code);
    }

    // If not JSON, create a basic structure from the text
    return {
      type: "frame",
      name: "Generated UI",
      children: [
        {
          type: "text",
          content: code,
          fontSize: 16,
          color: "#000000",
        },
      ],
    };
  } catch (error) {
    // Fallback: create a simple text frame
    return {
      type: "frame",
      name: "Generated UI",
      children: [
        {
          type: "text",
          content: code,
          fontSize: 14,
          color: "#333333",
        },
      ],
    };
  }
}

async function createUIElements(designData, prompt) {
  // Create main frame
  const frame = figma.createFrame();
  frame.name = `Jarvis UI: ${prompt.substring(0, 30)}...`;
  frame.x = 0;
  frame.y = 0;
  frame.resize(800, 600);
  frame.fills = [
    {
      type: "SOLID",
      color: { r: 1, g: 1, b: 1 },
    },
  ];

  // Add title
  const title = figma.createText();
  title.characters = `Generated UI: ${prompt}`;
  title.fontSize = 24;
  title.fills = [
    {
      type: "SOLID",
      color: { r: 0, g: 0, b: 0 },
    },
  ];
  title.x = 20;
  title.y = 20;
  frame.appendChild(title);

  // Create elements based on design data
  if (designData.children) {
    await createChildren(frame, designData.children, 20, 80);
  }

  // Add to current page
  figma.currentPage.appendChild(frame);

  return frame;
}

async function createChildren(parent, children, startX, startY) {
  let currentY = startY;

  for (const child of children) {
    let element;

    switch (child.type) {
      case "text":
        element = figma.createText();
        element.characters = child.content || "Text";
        element.fontSize = child.fontSize || 16;
        element.fills = [
          {
            type: "SOLID",
            color: hexToRgb(child.color || "#000000"),
          },
        ];
        break;

      case "rectangle":
        element = figma.createRectangle();
        element.resize(child.width || 200, child.height || 100);
        element.fills = [
          {
            type: "SOLID",
            color: hexToRgb(child.color || "#cccccc"),
          },
        ];
        break;

      case "frame":
        element = figma.createFrame();
        element.resize(child.width || 300, child.height || 200);
        element.fills = [
          {
            type: "SOLID",
            color: hexToRgb(child.color || "#f0f0f0"),
          },
        ];
        break;

      default:
        // Create a simple rectangle for unknown types
        element = figma.createRectangle();
        element.resize(200, 50);
        element.fills = [
          {
            type: "SOLID",
            color: { r: 0.9, g: 0.9, b: 0.9 },
          },
        ];
    }

    element.x = startX;
    element.y = currentY;
    parent.appendChild(element);

    currentY += (child.height || 50) + 20;
  }
}

async function createComponentFromData(componentData) {
  // Create a component from the provided data
  const frame = figma.createFrame();
  frame.name = componentData.name || "Component";
  frame.resize(componentData.width || 200, componentData.height || 100);

  // Add the component to the current page
  figma.currentPage.appendChild(frame);

  return frame;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
}

// Send initial status
figma.ui.postMessage({
  type: "status",
  message: "Jarvis Workstation plugin ready!",
});
