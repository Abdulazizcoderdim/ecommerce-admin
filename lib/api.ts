import axios from "axios";
import { API_BASE_URL, authService, User } from "./auth";

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  colours: string[];
  sizes: string[];
  stockStatus: boolean;
  countInStock: number;
  rating: number;
  numReviews: number;
  category: Category;
  deliveryOptions: {
    freeDelivery: boolean;
    returnDelivery: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  products: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "pending" | "confirmed" | "delivered";
  billingDetails: {
    firstName: string;
    companyName?: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    phone: string;
    email: string;
  };
  operator: Operator;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

export class ApiService {
  async getProducts(page = 1, limit = 10): Promise<PaginatedResponse<Product>> {
    const response = await axios.get<PaginatedResponse<Product>>(
      `${API_BASE_URL}/products?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async createProduct(
    formData: FormData
  ): Promise<{ message: string; product: Product }> {
    const response = await authService.makeAuthenticatedRequest(
      `${API_BASE_URL}/products`,
      {
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response;
  }

  async updateProduct(
    productId: string,
    formData: FormData
  ): Promise<{ message: string; product: Product }> {
    const response = await authService.makeAuthenticatedRequest(
      `${API_BASE_URL}/products/${productId}`,
      {
        method: "PUT",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response;
  }

  async deleteProduct(productId: string): Promise<void> {
    await authService.makeAuthenticatedRequest(
      `${API_BASE_URL}/products/${productId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getCategories(
    page = 1,
    limit = 100
  ): Promise<PaginatedResponse<Category>> {
    const response = await axios.get<PaginatedResponse<Category>>(
      `${API_BASE_URL}/category?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async createCategory(name: string): Promise<Category> {
    const response = await authService.makeAuthenticatedRequest<Category>(
      `${API_BASE_URL}/category/create`,
      {
        method: "POST",
        data: { name },
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
      }
    );
    return response;
  }

  async updateCategory(categoryId: string, name: string): Promise<Category> {
    const response = await authService.makeAuthenticatedRequest<Category>(
      `${API_BASE_URL}/category/${categoryId}`,
      {
        method: "PUT",
        data: { name },
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
      }
    );
    return response;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await authService.makeAuthenticatedRequest(
      `${API_BASE_URL}/category/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
      }
    );
  }

  async getOrders(page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    const response = await authService.makeAuthenticatedRequest<
      PaginatedResponse<Order>
    >(`${API_BASE_URL}/operator/orders?page=${page}&limit=${limit}`);
    return response;
  }

  async getMyOrders(page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    const response = await authService.makeAuthenticatedRequest<
      PaginatedResponse<Order>
    >(`${API_BASE_URL}/operator/my-orders?page=${page}&limit=${limit}`);
    return response;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await authService.makeAuthenticatedRequest<Order>(
      `${API_BASE_URL}/operator/orders/${orderId}`
    );
    return response;
  }

  async updateOrderStatus(
    orderId: string,
    status: "pending" | "confirmed" | "delivered"
  ): Promise<Order> {
    const response = await authService.makeAuthenticatedRequest<Order>(
      `${API_BASE_URL}/operator/orders/${orderId}/status`,
      {
        method: "PUT",
        data: { status },
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
      }
    );
    return response;
  }

  async assignOrder(orderId: string, operatorId: string): Promise<Order> {
    const response = await authService.makeAuthenticatedRequest<Order>(
      `${API_BASE_URL}/operator/orders/assign`,
      {
        method: "POST",
        data: { orderId, operatorId },
      }
    );
    return response;
  }

  async getOperators(): Promise<Operator[]> {
    const response = await authService.makeAuthenticatedRequest<Operator[]>(
      `${API_BASE_URL}/operator/operators`
    );
    return response;
  }
}

export const apiService = new ApiService();
