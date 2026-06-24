import { moveInstrumentation } from '../../scripts/scripts.js';

function createTextField(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const label = cells[0]?.textContent?.trim() || '';
  const placeholder = cells[1]?.textContent?.trim() || '';
  const required = cells[2]?.textContent?.trim() === 'true';

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
  if (label) input.name = label.toLowerCase().replace(/\s+/g, '-');

  wrapper.appendChild(input);
  return wrapper;
}

function createEmailField(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const label = cells[0]?.textContent?.trim() || '';
  const placeholder = cells[1]?.textContent?.trim() || '';
  const required = cells[2]?.textContent?.trim() === 'true';

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
  if (label) input.name = label.toLowerCase().replace(/\s+/g, '-');

  wrapper.appendChild(input);
  return wrapper;
}

function createCheckboxField(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field form-field-checkbox';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const label = cells[0]?.textContent?.trim() || '';
  const required = cells[1]?.textContent?.trim() === 'true';
  const checked = cells[2]?.textContent?.trim() === 'true';

  const checkboxWrapper = document.createElement('div');
  checkboxWrapper.className = 'checkbox-wrapper';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'form-checkbox';
  if (required) input.required = true;
  if (checked) input.checked = true;
  if (label) input.name = label.toLowerCase().replace(/\s+/g, '-');

  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  if (required) {
    labelEl.innerHTML += ' <span class="required">*</span>';
  }

  checkboxWrapper.append(input, labelEl);
  wrapper.appendChild(checkboxWrapper);
  return wrapper;
}

function createSubmitButton(row) {
  const wrapper = document.createElement('div');
  wrapper.className = 'button-container';
  moveInstrumentation(row, wrapper);

  const cells = [...row.children];
  const text = cells[0]?.textContent?.trim() || 'Submit';
  const type = cells[1]?.textContent?.trim() || 'primary';

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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle form submission here
    const formData = new FormData(form);
    console.log('Form submitted:', Object.fromEntries(formData));
    // You can add your form submission logic here
  });

  // Process each row (child) in the block
  [...block.children].forEach((row) => {
    // Check if this row has a data-block-name attribute to identify the field type
    const blockName = row.getAttribute('data-block-name');
    
    let fieldElement;
    switch (blockName) {
      case 'form-text-field':
        fieldElement = createTextField(row);
        break;
      case 'form-email-field':
        fieldElement = createEmailField(row);
        break;
      case 'form-checkbox-field':
        fieldElement = createCheckboxField(row);
        break;
      case 'form-submit-button':
        fieldElement = createSubmitButton(row);
        break;
      default:
        // If no block name, skip this row
        return;
    }

    if (fieldElement) {
      form.appendChild(fieldElement);
    }
  });

  // Replace block content with form
  block.replaceChildren(form);
}
