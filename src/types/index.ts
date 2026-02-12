/**
 * 类型定义文件
 */

// 仓库信息
export interface RepoInfo {
    owner: string;
    repo: string;
}

// 文件存在检查结果
export interface FileExistsResult {
    exists: boolean;
    sha: string | null;
}

// 远程文件信息
export interface RemoteFilesResult {
    remoteFiles: Set<string>;
    remoteFileShas: Map<string, string>;
}

// 目录项
export interface DirItem {
    name: string;
    type: string;
    isDir?: boolean;
}

// 配置信息
export interface GitConfig {
    repositoryUrl: string;
    branch: string;
    authToken: string;
    commitTemplate: string;
    workspaceDir: string;
    syncMode: string;
    syncInterval: number;
}

// 完整配置
export interface FullConfig {
    gitConf: GitConfig;
}

// 同步模式
export type SyncMode = 'auto' | 'manual';

// 对话框元素类型
export interface DialogElement {
    element: HTMLElement;
}

// 分支信息
export interface BranchInfo {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
}

// GitHub API 响应
export interface GitHubFileResponse {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    type: string;
    content: string;
    encoding: string;
    _links: {
        self: string;
        git: string;
        html: string;
    };
}

// GitHub 提交响应
export interface GitHubCommitResponse {
    sha: string;
    node_id: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        tree: {
            sha: string;
            url: string;
        };
        url: string;
        comment_count: number;
        verification: {
            verified: boolean;
            reason: string;
            signature: string | null;
            payload: string | null;
        };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
    } | null;
    committer: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
    } | null;
    parents: Array<{
        sha: string;
        url: string;
        html_url: string;
    }>;
}

// GitHub 树响应
export interface GitHubTreeResponse {
    sha: string;
    url: string;
    tree: Array<{
        path: string;
        mode: string;
        type: string;
        sha: string;
        size: number | null;
        url: string | null;
    }>;
    truncated: boolean;
}
