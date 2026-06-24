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
  const label = cells[2]?.textContent?.trim() || '';
  const required = cells[3]?.textContent?.trim() === 'true';
  const checked = cells[4]?.textContent?.trim() === 'true';

  // Add field title like other fields
  if (label) {
    const titleEl = document.createElement('label');
    titleEl.className = 'field-title';
    titleEl.textContent = label;
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
  input.name = fieldName || label.toLowerCase().replace(/\s+/g, '-');

  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  if (required) {
    labelEl.innerHTML += ' <span class="required">*</span>';
  }

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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle form submission here
    const formData = new FormData(form);
    console.log('Form submitted:', Object.fromEntries(formData));
    // You can add your form submission logic here
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
