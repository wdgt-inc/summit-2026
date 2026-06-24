import { moveInstrumentation } from '../../scripts/scripts.js';

function createTextField(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const fieldName = cells[1]?.textContent?.trim() || '';
  const label = cells[2]?.textContent?.trim() || '';
  const placeholder = cells[3]?.textContent?.trim() || '';
  const required = cells[4]?.textContent?.trim() === 'true';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    if (required) {
      labelEl.innerHTML += ' <span class="required">*</span>';
    }
    wrapper.appendChild(labelEl);
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-input';
  if (placeholder) input.placeholder = placeholder;
  if (required) input.required = true;
  input.name = fieldName || label.toLowerCase().replace(/\s+/g, '-');

  wrapper.appendChild(input);
  return wrapper;
}

function createEmailField(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const fieldName = cells[1]?.textContent?.trim() || '';
  const label = cells[2]?.textContent?.trim() || '';
  const placeholder = cells[3]?.textContent?.trim() || '';
  const required = cells[4]?.textContent?.trim() === 'true';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    if (required) {
      labelEl.innerHTML += ' <span class="required">*</span>';
    }
    wrapper.appendChild(labelEl);
  }

  const input = document.createElement('input');
  input.type = 'email';
  input.className = 'form-input';
  if (placeholder) input.placeholder = placeholder;
  if (required) input.required = true;
  input.name = fieldName || label.toLowerCase().replace(/\s+/g, '-');

  wrapper.appendChild(input);
  return wrapper;
}

function createCheckboxField(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field form-field-checkbox';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const fieldName = cells[1]?.textContent?.trim() || '';
  const title = cells[2]?.textContent?.trim() || '';
  const label = cells[3]?.textContent?.trim() || '';
  const required = cells[4]?.textContent?.trim() === 'true';
  const checked = cells[5]?.textContent?.trim() === 'true';

  // Add field title (with required asterisk if needed)
  if (title) {
    const titleEl = document.createElement('label');
    titleEl.className = 'field-title';
    titleEl.textContent = title;
    if (required) {
      titleEl.innerHTML += ' <span class="required">*</span>';
    }
    wrapper.appendChild(titleEl);
  }

  const checkboxWrapper = document.createElement('div');
  checkboxWrapper.className = 'checkbox-wrapper';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'form-checkbox';
  if (required) input.required = true;
  if (checked) input.checked = true;
  input.name = fieldName || (title || label).toLowerCase().replace(/\s+/g, '-');

  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  // No required asterisk on the label - only on the title

  checkboxWrapper.append(input, labelEl);
  wrapper.appendChild(checkboxWrapper);
  return wrapper;
}

function createCheckboxGroup(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field form-field-checkbox-group';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const fieldName = cells[1]?.textContent?.trim() || '';
  const label = cells[2]?.textContent?.trim() || '';
  const optionsText = cells[3]?.textContent?.trim() || '';
  const required = cells[4]?.textContent?.trim() === 'true';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    if (required) {
      labelEl.innerHTML += ' <span class="required">*</span>';
    }
    wrapper.appendChild(labelEl);
  }

  // Parse options (comma-separated)
  const options = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt);
  
  const checkboxesWrapper = document.createElement('div');
  checkboxesWrapper.className = 'checkbox-group-options';

  options.forEach((option, index) => {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'form-checkbox';
    const baseName = fieldName || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'checkbox-group');
    input.name = `${baseName}[]`;
    input.value = option;
    input.id = `${baseName}-${index}`;

    const optionLabel = document.createElement('label');
    optionLabel.textContent = option;
    optionLabel.htmlFor = input.id;

    checkboxWrapper.append(input, optionLabel);
    checkboxesWrapper.appendChild(checkboxWrapper);
  });

  wrapper.appendChild(checkboxesWrapper);
  return wrapper;
}

function createHiddenField(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field form-field-hidden';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const fieldName = cells[1]?.textContent?.trim() || '';
  const value = cells[2]?.textContent?.trim() || '';

  // Create a visible label for the editor
  const label = document.createElement('label');
  label.className = 'hidden-field-label';
  label.textContent = `Hidden Field: ${fieldName}`;
  wrapper.appendChild(label);

  // Create a visible display of the value for the editor
  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'hidden-field-value';
  valueDisplay.textContent = `Value: ${value}`;
  wrapper.appendChild(valueDisplay);

  // Create the actual hidden input
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = fieldName;
  input.value = value;

  wrapper.appendChild(input);
  return wrapper;
}

function createSubmitButton(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'button-container';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const text = cells[1]?.textContent?.trim() || 'Submit';
  const type = cells[2]?.textContent?.trim() || 'primary';

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = `button ${type}`;
  button.textContent = text;

  wrapper.appendChild(button);
  return wrapper;
}

export default function decorate(block) {
  // Create form element
  const form = document.createElement('form');
  form.className = 'form-content';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(form);
    const data = {};
    
    // Helper function to set nested property using dot notation
    const setNestedProperty = (obj, path, value) => {
      const keys = path.split('.');
      let current = obj;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
    };
    
    // Process form fields
    formData.forEach((value, key) => {
      // Handle checkbox groups (arrays)
      if (key.endsWith('[]')) {
        const cleanKey = key.slice(0, -2);
        if (!data[cleanKey]) {
          data[cleanKey] = [];
        }
        data[cleanKey].push(value);
      } else {
        // Use dot notation to create nested structure
        setNestedProperty(data, key, value);
      }
    });
    
    // Build the Adobe Experience Platform payload
    const payload = {
      header: {
        schemaRef: {
          id: 'https://ns.adobe.com/ibmixpartnersandbox/schemas/6d9c231e5c5a8b86e00fe5b97ba154eaa07d9f3726b7730b',
          contentType: 'application/vnd.adobe.xed-full+json;version=1.0',
        },
        imsOrgId: 'E6617B8657177C8B7F000101@AdobeOrg',
        datasetId: '6a39706fc9ecaa8529f72180',
        source: {
          name: 'Event Prospect Ingest',
        },
      },
      body: {
        xdmMeta: {
          schemaRef: {
            id: 'https://ns.adobe.com/ibmixpartnersandbox/schemas/6d9c231e5c5a8b86e00fe5b97ba154eaa07d9f3726b7730b',
            contentType: 'application/vnd.adobe.xed-full+json;version=1.0',
          },
        },
        xdmEntity: {
          _ibmixpartnersandbox: {
            ...data,
          },
          _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          eventType: 'advertising.completes',
          timestamp: new Date().toISOString(),
        },
      },
    };
    
    // Log the payload to console for verification
    console.log('Form payload (not submitted):', JSON.stringify(payload, null, 2));
    console.log('Payload object:', payload);
    
    // TODO: Uncomment below to actually submit to Adobe Experience Platform
    /*
    try {
      const response = await fetch('https://dcs.adobedc.net/collection/d159a06882a86f910bae90242ec40400641434995273556aac8dae8677b21891', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        console.log('Form submitted successfully');
        alert('Thank you for your submission!');
        form.reset();
      } else {
        console.error('Form submission failed:', response.status, response.statusText);
        alert('There was an error submitting the form. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting the form. Please try again.');
    }
    */
  });

  // Process each row (child) in the block
  [...block.children].forEach((row) => {
    // Get the field type from the first cell or data-block-name attribute
    const cells = [...row.children];
    const fieldType = cells[0]?.textContent?.trim().toLowerCase();
    const blockName = row.getAttribute('data-block-name');
    
    let fieldElement;
    // Check both fieldType (from HTML) and blockName (from data attribute)
    if (fieldType === 'text' || blockName === 'form-text-field') {
      fieldElement = createTextField(row);
    } else if (fieldType === 'email' || blockName === 'form-email-field') {
      fieldElement = createEmailField(row);
    } else if (fieldType === 'checkbox' || blockName === 'form-checkbox-field') {
      fieldElement = createCheckboxField(row);
    } else if (fieldType === 'checkbox-group' || blockName === 'form-checkbox-group') {
      fieldElement = createCheckboxGroup(row);
    } else if (fieldType === 'hidden' || blockName === 'form-hidden-field') {
      fieldElement = createHiddenField(row);
    } else if (fieldType === 'submit' || blockName === 'form-submit-button') {
      fieldElement = createSubmitButton(row);
    }

    if (fieldElement) {
      form.appendChild(fieldElement);
    }
  });

  // Replace block content with form
  block.replaceChildren(form);
}
