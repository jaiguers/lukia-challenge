import axios, { AxiosInstance } from 'axios';

export interface Task {
  id?: string;
  _id?: string; // MongoDB uses _id
  title: string;
  description?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to get the ID from a task (handles both id and _id)
export function getTaskId(task: Task): string {
  return task.id || task._id || '';
}

export interface TaskTree extends Task {
  subtasks?: TaskTree[];
  children?: TaskTree[]; // API returns children, we map to subtasks
}

// Response structure from GET /tasks/{id}
export interface TaskWithChildrenResponse {
  task: Task;
  children: Task[];
}

// Response structure from GET /tasks/{id}/tree
export interface TaskTreeResponse {
  task: Task;
  children: TaskTree[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  parentId?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
}

export class TasksApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Remove Content-Type header for DELETE requests
    this.client.interceptors.request.use((config) => {
      if (config.method === 'delete') {
        delete config.headers['Content-Type'];
      }
      return config;
    });
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post<Task>('/tasks', task);
    const data = response.data;
    // Normalize _id to id for consistency
    if ((data as any)._id && !data.id) {
      data.id = (data as any)._id;
    }
    return data;
  }

  async listTasks(): Promise<Task[]> {
    const response = await this.client.get<Task[]>('/tasks');
    return response.data;
  }

  async getTask(taskId: string): Promise<Task> {
    const response = await this.client.get<TaskWithChildrenResponse>(`/tasks/${taskId}`);
    
    const data = response.data.task;
    // Normalize _id to id for consistency
    if ((data as any)._id && !data.id) {
      data.id = (data as any)._id;
    }
    return data;
  }

  async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<Task> {
    const response = await this.client.patch<Task>(`/tasks/${taskId}`, updates);
    const data = response.data;
    // Normalize _id to id for consistency
    if ((data as any)._id && !data.id) {
      data.id = (data as any)._id;
    }
    return data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete(`/tasks/${taskId}`);
  }

  // Helper function to recursively map children to subtasks and normalize IDs
  private normalizeTaskTree(treeData: any): TaskTree {
    // Normalize the ID (handle both _id and id)
    const normalizedId = treeData._id || treeData.id || '';
    
    const task: TaskTree = {
      id: normalizedId,
      _id: treeData._id,
      title: treeData.title || '',
      description: treeData.description ?? null,
      status: (treeData.status || 'pending') as 'pending' | 'in_progress' | 'completed',
      parentId: treeData.parentId ?? null,
      createdAt: treeData.createdAt,
      updatedAt: treeData.updatedAt,
      subtasks: [], // Initialize subtasks array
    };

    // Map children to subtasks recursively
    // Handle both children and subtasks fields (API /tree returns subtasks, /tasks/{id} returns children)
    const childrenArray = treeData.children || treeData.subtasks || [];
    
    if (childrenArray && Array.isArray(childrenArray) && childrenArray.length > 0) {
      
      task.subtasks = childrenArray.map((child: any, index: number) => {
        // Each child might have children or subtasks field - normalize both
        const childData: any = {
          ...child,
          // Map subtasks to children if present, otherwise use children
          children: child.children || child.subtasks || [],
        };
        // Remove subtasks field to avoid confusion
        if (childData.subtasks !== undefined) {
          delete childData.subtasks;
        }
        return this.normalizeTaskTree(childData);
      });
      console.log(`normalizeTaskTree: Created ${task.subtasks.length} subtasks`);
    } else {
      console.log(`normalizeTaskTree: No children/subtasks found. Array length: ${childrenArray?.length || 0}`);
    }

    return task;
  }

  async getTree(taskId: string): Promise<TaskTree> {
    const response = await this.client.get<any>(`/tasks/${taskId}/tree`);
    
    const responseData = response.data;
    
    // The /tree endpoint returns the task directly with subtasks field
    // NOT { task: {...}, children: [...] } - that's from /tasks/{id}
    // So we need to map subtasks to children for normalization
    let treeData: any;
    
    if (responseData) {
      // Map subtasks to children for normalization
      // Remove subtasks field and use children instead to avoid confusion
      treeData = {
        ...responseData,
      };
      
      // Delete subtasks field if it exists, we'll use children
      if (treeData.subtasks) {
        treeData.children = treeData.subtasks;
        delete treeData.subtasks;
      } else if (!treeData.children) {
        treeData.children = [];
      }
      
      const normalized = this.normalizeTaskTree(treeData);
      
      return normalized;
    }
    
    // Fallback
    return this.normalizeTaskTree({});
  }
}

