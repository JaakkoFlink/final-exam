// State management
let currentCustomerId = null;

// Load customers on page load
loadCustomers();

// Form elements
const form = document.getElementById("customerForm");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");
const clearBtn = document.getElementById("clearBtn");

// Form inputs
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const birthDateInput = document.getElementById("birthDate");

// Event listeners
form.addEventListener("submit", handleFormSubmit);
updateBtn.addEventListener("click", handleUpdate);
deleteBtn.addEventListener("click", handleDelete);
clearBtn.addEventListener("click", clearForm);

// Load and display all customers
async function loadCustomers() {
  const container = document.getElementById("customer-list");

  try {
    const res = await fetch("/api/persons");

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await res.json();

    // Clear placeholder
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p>No customers found.</p>";
      return;
    }

    // Create customer cards
    data.forEach(person => {
      const div = document.createElement("div");
      div.className = "customer-card";
      div.dataset.customerId = person.id;

      div.innerHTML = `
        <strong>${person.first_name} ${person.last_name}</strong><br>
        Email: ${person.email}<br>
        Phone: ${person.phone || "-"}<br>
        Birth Date: ${person.birth_date || "-"}
      `;

      div.addEventListener("click", () => {
        selectCustomer(person);
      });

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red;'>Error loading data</p>";
  }
}

// Select a customer and populate the form
function selectCustomer(customer) {
  currentCustomerId = customer.id;

  firstNameInput.value = customer.first_name || "";
  lastNameInput.value = customer.last_name || "";
  emailInput.value = customer.email || "";
  phoneInput.value = customer.phone || "";
  birthDateInput.value = customer.birth_date || "";

  // Show update and delete buttons, hide submit button
  submitBtn.style.display = "none";
  updateBtn.style.display = "inline-block";
  deleteBtn.style.display = "inline-block";

  // Highlight selected customer card
  document.querySelectorAll(".customer-card").forEach(card => {
    card.classList.remove("selected");
  });
  document.querySelector(`[data-customer-id="${customer.id}"]`).classList.add("selected");

  // Scroll to form
  document.getElementById("customer-form").scrollIntoView({ behavior: "smooth" });
}

// Handle form submission (Create new customer)
async function handleFormSubmit(e) {
  e.preventDefault();

  const newCustomer = {
    first_name: firstNameInput.value,
    last_name: lastNameInput.value,
    email: emailInput.value,
    phone: phoneInput.value || null,
    birth_date: birthDateInput.value || null
  };

  try {
    const res = await fetch("/api/persons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newCustomer)
    });

    if (!res.ok) {
      throw new Error("Failed to add customer");
    }

    clearForm();
    loadCustomers();
  } catch (err) {
    console.error(err);
    alert("Error adding customer: " + err.message);
  }
}

// Handle update
async function handleUpdate() {
  if (!currentCustomerId) return;

  const updatedCustomer = {
    first_name: firstNameInput.value,
    last_name: lastNameInput.value,
    email: emailInput.value,
    phone: phoneInput.value || null,
    birth_date: birthDateInput.value || null
  };

  try {
    const res = await fetch(`/api/persons/${currentCustomerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedCustomer)
    });

    if (!res.ok) {
      throw new Error("Failed to update customer");
    }

    clearForm();
    loadCustomers();
  } catch (err) {
    console.error(err);
    alert("Error updating customer: " + err.message);
  }
}

// Handle delete
async function handleDelete() {
  if (!currentCustomerId) return;

  if (!confirm("Are you sure you want to delete this customer?")) {
    return;
  }

  try {
    const res = await fetch(`/api/persons/${currentCustomerId}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Failed to delete customer");
    }

    clearForm();
    loadCustomers();
  } catch (err) {
    console.error(err);
    alert("Error deleting customer: " + err.message);
  }
}

// Clear form and reset state
function clearForm() {
  form.reset();
  currentCustomerId = null;

  // Show submit button, hide update and delete buttons
  submitBtn.style.display = "inline-block";
  updateBtn.style.display = "none";
  deleteBtn.style.display = "none";

  // Remove highlight from all customer cards
  document.querySelectorAll(".customer-card").forEach(card => {
    card.classList.remove("selected");
  });
}
