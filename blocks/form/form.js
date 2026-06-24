function createTextField(item) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';

  const label = item.querySelector('[data-model-name="label"]')?.textContent?.trim() || '';
  const placeholder = item.querySelector('[data-model-name="placeholder"]')?.textContent?.trim() || '';
  const required = item.querySelector('[data-model-name="required"]')?.textContent?.trim() === 'true';

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

function createEmailField(item) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';

  const label = item.querySelector('[data-model-name="label"]')?.textContent?.trim() || '';
  const placeholder = item.querySelector('[data-model-name="placeholder"]')?.textContent?.trim() || '';
  const required = item.querySelector('[data-model-name="required"]')?.textContent?.trim() === 'true';

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

function createCheckboxField(item) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field form-field-checkbox';

  const label = item.querySelector('[data-model-name="label"]')?.textContent?.trim() || '';
  const required = item.querySelector('[data-model-name="required"]')?.textContent?.trim() === 'true';
  const checked = item.querySelector('[data-model-name="checked"]')?.textContent?.trim() === 'true';

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

function createSubmitButton(item) {
  const wrapper = document.createElement('div');
  wrapper.className = 'button-container';

  const text = item.querySelector('[data-model-name="text"]')?.textContent?.trim() || 'Submit';
  const type = item.querySelector('[data-model-name="type"]')?.textContent?.trim() || 'primary';

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = `button ${type}`;
  button.textContent = text;

  wrapper.appendChild(button);
  return wrapper;
}

export default function decorate(block) {
  // Get the form title if it exists
  const titleElement = block.querySelector('[data-model-name="title"]');
  const title = titleElement?.textContent?.trim();

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

  // Add title if it exists
  if (title) {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    form.appendChild(h3);
  }

  // Process child components
  const items = block.querySelectorAll(':scope > div > div');
  items.forEach((item) => {
    const componentName = item.getAttribute('data-block-name');
    
    let fieldElement;
    switch (componentName) {
      case 'form-text-field':
        fieldElement = createTextField(item);
        break;
      case 'form-email-field':
        fieldElement = createEmailField(item);
        break;
      case 'form-checkbox-field':
        fieldElement = createCheckboxField(item);
        break;
      case 'form-submit-button':
        fieldElement = createSubmitButton(item);
        break;
      default:
        return;
    }

    if (fieldElement) {
      form.appendChild(fieldElement);
    }
  });

  // Replace block content with form
  block.textContent = '';
  block.appendChild(form);
}

// Made with Bob
