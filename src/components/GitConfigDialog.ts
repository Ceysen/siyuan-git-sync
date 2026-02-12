import { Dialog, Plugin, showMessage } from "siyuan";
import { readDir, getFileBlob, putFile } from "../api";

export class GitConfigDialog {
    /**
     * 显示 Git 同步配置弹窗
     */
    static showGitConfigDialog(plugin: Plugin) {
        const dialog = new Dialog({
            title: "Git 同步配置",
            content: `<div class="b3-dialog__content" style="padding: 20px;">
                <div class="fn__flex-column">
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">GitHub 仓库地址 <span style="color: #ff4d4f;">*</span></label>
                        <input type="text" id="repositoryUrl" class="b3-text-field" placeholder="https://github.com/username/repo.git" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">填写你想同步的 GitHub 仓库 HTTPS 地址</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">分支名称 <span style="color: #ff4d4f;">*</span></label>
                        <input type="text" id="branch" class="b3-text-field" placeholder="main" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">默认分支用于 push 操作</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Personal Access Token <span style="color: #ff4d4f;">*</span></label>
                        <input type="password" id="authToken" class="b3-text-field" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">用于认证 GitHub 权限，必须有 push 权限</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">默认 Commit 信息模板 <span style="color: #ff4d4f;">*</span></label>
                        <input type="text" id="commitTemplate" class="b3-text-field" placeholder="同步笔记更新：{{date}}" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">可使用 {{date}} 占位符自动生成提交信息</div>
                    </div>
                    

                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">笔记目录 <span style="color: #ff4d4f;">*</span></label>
                        <input type="text" id="workspaceDir" class="b3-text-field" placeholder="例如：123 或 123/321" style="width: 100%;" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">会自动添加 /data/ 前缀，多个笔记之间用英文逗号分隔，且会默认检查 assets 文件夹。</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">同步模式</label>
                        <select id="syncMode" class="b3-text-field" style="width: 100%;">
                            <option value="auto">自动同步</option>
                            <option value="manual">手动同步</option>
                        </select>
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">选择插件的同步模式</div>
                    </div>
                    
                    <div class="fn__flex-item" style="margin-bottom: 16px;" id="autoSyncSection">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">自动同步间隔（分钟）<span style="color: #ff4d4f;">*</span></label>
                        <input type="number" id="syncInterval" class="b3-text-field" placeholder="0" style="width: 100%;" min="0" />
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">设置插件自动同步的间隔时间</div>
                    </div>
                    

                    
                    <div class="fn__flex-item" style="margin-top: 24px; text-align: right;">
                        <button id="saveConfig" class="b3-btn b3-btn--primary" style="margin-right: 8px;">保存配置</button>
                        <button id="manualSyncBtn" class="b3-btn" style="margin-right: 8px; display: none;">手动同步</button>
                        <button id="overrideLocalBtn" class="b3-btn" style="margin-right: 8px; display: none;">覆盖本地</button>
                        <button id="cancelConfig" class="b3-btn">取消</button>
                    </div>
                </div>
            </div>`,
            width: window.innerWidth < 900 ? "92vw" : "800px",
            height: window.innerHeight < 900 ? "80vh" : "700px"
        });
        
        // 加载已保存的配置
        setTimeout(() => {
            const savedConfig = plugin.data.gitSyncConfig;
            if (savedConfig && savedConfig.gitConf) {
                const gitConf = savedConfig.gitConf;
                if (gitConf.repositoryUrl) {
                    (dialog.element.querySelector('#repositoryUrl') as HTMLInputElement).value = gitConf.repositoryUrl;
                }
                if (gitConf.branch) {
                    (dialog.element.querySelector('#branch') as HTMLInputElement).value = gitConf.branch;
                }
                if (gitConf.authToken) {
                    (dialog.element.querySelector('#authToken') as HTMLInputElement).value = gitConf.authToken;
                }
                if (gitConf.commitTemplate) {
                    // 确保显示包含 {{date}} 占位符的版本，而不是包含具体时间的版本
                    let commitTemplate = gitConf.commitTemplate;
                    // 如果 commitTemplate 包含时间格式（如 2026/2/10 15:37:21），则替换为 {{date}} 占位符
                    // 这里简单处理，始终使用默认模板格式
                    commitTemplate = "同步笔记更新：{{date}}";
                    (dialog.element.querySelector('#commitTemplate') as HTMLInputElement).value = commitTemplate;
                }
                if (gitConf.workspaceDir) {
                    // 从保存的路径中移除 /data/ 前缀，显示原始的用户输入格式
                    let originalWorkspaceDir = gitConf.workspaceDir;
                    // 移除 /data/ 前缀
                    originalWorkspaceDir = originalWorkspaceDir.replace(/^\/data\//, '');
                    (dialog.element.querySelector('#workspaceDir') as HTMLInputElement).value = originalWorkspaceDir;
                }
                if (gitConf.syncMode) {
                    (dialog.element.querySelector('#syncMode') as HTMLSelectElement).value = gitConf.syncMode;
                }
                if (gitConf.syncInterval) {
                    (dialog.element.querySelector('#syncInterval') as HTMLInputElement).value = gitConf.syncInterval.toString();
                }
            }
            
            // 初始化同步模式显示
            updateSyncModeUI();
        }, 100);
        
        // 执行同步操作的函数
        async function performSync() {
            console.log('执行同步...');
            
            // 获取笔记目录
            const notesDir = (dialog.element.querySelector('#workspaceDir') as HTMLInputElement).value.trim();
            
            if (!notesDir) {
                showMessage('请先填写笔记目录');
                return false;
            }
            
            try {
                // 分割多个目录（用英文逗号分隔）
                const dirs = notesDir.split(',').map(dir => dir.trim()).filter(dir => dir !== '');
                
                // 从输入框获取仓库地址
                const repositoryUrl = (dialog.element.querySelector('#repositoryUrl') as HTMLInputElement).value.trim();
                if (!repositoryUrl) {
                    showMessage('请先填写 GitHub 仓库地址');
                    return false;
                }
                
                // 从仓库地址中提取 owner 和 repo
                function extractOwnerAndRepo(url) {
                    // 匹配 HTTPS 格式：https://github.com/owner/repo.git
                    const match = url.match(/https:\/\/github\.com\/(.*?)\/(.*?)\.git$/);
                    if (match) {
                        return {
                            owner: match[1],
                            repo: match[2]
                        };
                    }
                    return null;
                }
                
                const repoInfo = extractOwnerAndRepo(repositoryUrl);
                if (!repoInfo) {
                    showMessage('GitHub 仓库地址格式不正确');
                    return false;
                }
                
                // 从输入框获取分支名称
                const branch = (dialog.element.querySelector('#branch') as HTMLInputElement).value.trim() || 'main';
                
                // 从输入框获取认证 token
                const authToken = (dialog.element.querySelector('#authToken') as HTMLInputElement).value.trim();
                if (!authToken) {
                    showMessage('请先填写 Personal Access Token');
                    return false;
                }
                
                // 检查单个文件是否存在于远程仓库
                async function checkFileExistsInRemote(owner, repo, branch, filePath, token) {
                    try {
                        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
                        const response = await fetch(apiUrl, {
                            method: 'GET',
                            headers: {
                                'Authorization': `token ${token}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        });
                        
                        if (response.status === 200) {
                            const data = await response.json();
                            return {
                                exists: true,
                                sha: data.sha
                            };
                        } else if (response.status === 404) {
                            return {
                                exists: false,
                                sha: null
                            };
                        } else {
                            throw new Error(`API 请求失败: ${response.statusText}`);
                        }
                    } catch (error) {
                        console.error(`检查文件 ${filePath} 失败:`, error);
                        return {
                            exists: false,
                            sha: null
                        };
                    }
                }
                
                // 上传文件到远程仓库
                async function uploadFileToRemote(owner, repo, branch, filePath, content, token, sha = null) {
                    try {
                        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
                        
                        // 从配置中获取 commit 模板
                        const commitTemplate = (dialog.element.querySelector('#commitTemplate') as HTMLInputElement).value.trim() || "同步笔记更新：{{date}}";
                        // 处理 commit 信息中的 {{date}} 占位符
                        let commitMessage = commitTemplate;
                        const now = new Date();
                        const dateString = now.toLocaleString();
                        commitMessage = commitMessage.replace(/\{\{date\}\}/g, dateString);
                        
                        const payload = {
                            message: commitMessage,
                            content: content,
                            branch: branch
                        };
                        
                        // 如果文件存在，添加 sha 参数
                        if (sha) {
                            payload.sha = sha;
                        }
                        
                        const response = await fetch(apiUrl, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `token ${token}`,
                                'Accept': 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });
                        
                        if (response.status === 201 || response.status === 200) {
                            return true;
                        } else {
                            const errorData = await response.json();
                            throw new Error(`上传文件失败: ${errorData.message || response.statusText}`);
                        }
                    } catch (error) {
                        console.error(`上传文件 ${filePath} 失败:`, error);
                        return false;
                    }
                }
                
                // 执行文件对比
                async function performFileComparison() {
                    try {
                        // 收集本地文件路径
                        const localFiles = new Set();
                        
                        // 遍历目录下的所有文件
                        async function collectLocalFiles(dirPath) {
                            try {
                                const files = await readDir(dirPath);
                                
                                if (!files || !Array.isArray(files)) {
                                    return;
                                }
                                
                                for (const item of files) {
                                    const fullPath = `${dirPath}/${item.name}`;
                                    if (item.type === 'dir' || item.isDir) {
                                        // 递归遍历子目录
                                        await collectLocalFiles(fullPath);
                                    } else {
                                        // 构建相对于工作空间根目录的路径
                                        const relativePath = fullPath.replace(/^\/data\//, '');
                                        localFiles.add(relativePath);
                                    }
                                }
                            } catch (error) {
                                // 静默处理错误，不输出到控制台
                            }
                        }
                        
                        // 收集远程文件路径和SHA值
                        const remoteFiles = new Set();
                        const remoteFileShas = new Map(); // 存储文件路径到SHA值的映射
                        
                        // 使用 Git Trees API 一次性获取整个仓库的文件树
                        async function collectRemoteFiles() {
                            try {
                                // 首先获取默认分支的最新提交
                                const commitApiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits/${branch}`;
                                const commitResponse = await fetch(commitApiUrl, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `token ${authToken}`,
                                        'Accept': 'application/vnd.github.v3+json'
                                    }
                                });
                                
                                if (!commitResponse.ok) {
                                    throw new Error(`获取最新提交失败: ${commitResponse.statusText}`);
                                }
                                
                                const commitData = await commitResponse.json();
                                const treeSha = commitData.sha;
                                
                                // 使用 Git Trees API 获取文件树
                                const treeApiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${treeSha}?recursive=1`;
                                const treeResponse = await fetch(treeApiUrl, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `token ${authToken}`,
                                        'Accept': 'application/vnd.github.v3+json'
                                    }
                                });
                                
                                if (!treeResponse.ok) {
                                    throw new Error(`获取文件树失败: ${treeResponse.statusText}`);
                                }
                                
                                const treeData = await treeResponse.json();
                                
                                if (treeData.tree && Array.isArray(treeData.tree)) {
                                    for (const item of treeData.tree) {
                                        if (item.type === 'blob') {
                                            remoteFiles.add(item.path);
                                            remoteFileShas.set(item.path, item.sha);
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error(`获取远程文件列表失败:`, error);
                            }
                        }
                        
                        // 收集本地文件
                        for (const dir of dirs) {
                            // 处理目录路径，添加 /data/ 前缀并处理斜杠
                            let processedDir = dir;
                            // 移除首尾空格
                            processedDir = processedDir.trim();
                            // 移除首尾斜杠
                            processedDir = processedDir.replace(/^\/|\/$/g, '');
                            // 替换连续的斜杠为单个斜杠
                            processedDir = processedDir.replace(/\/+\//g, '/');
                            // 添加 /data/ 前缀
                            processedDir = `/data/${processedDir}`;
                            // 确保不以斜杠结尾
                            processedDir = processedDir.replace(/\/$/, '');
                            
                            // 收集本地文件
                            await collectLocalFiles(processedDir);
                        }
                        
                        // 收集 /data/assets 目录下的文件
                        await collectLocalFiles('/data/assets');
                        
                        // 收集远程文件
                        await collectRemoteFiles();
                        
                        // 找出远程存在但本地不存在的文件
                        const remoteOnlyFiles = [];
                        for (const file of remoteFiles) {
                            if (!localFiles.has(file)) {
                                remoteOnlyFiles.push(file);
                            }
                        }
                        
                        // 删除远程仓库中存在但本地不存在的文件
                        async function deleteRemoteFiles(filesToDelete) {
                            try {
                                if (filesToDelete.length === 0) {
                                    console.log('没有需要删除的远程文件');
                                    return;
                                }
                                
                                console.log('开始删除远程文件...');
                                
                                // 从配置中获取 commit 模板
                                const commitTemplate = (dialog.element.querySelector('#commitTemplate') as HTMLInputElement).value.trim() || "同步笔记更新：{{date}}";
                                // 处理 commit 信息中的 {{date}} 占位符
                                let commitMessage = commitTemplate;
                                const now = new Date();
                                const dateString = now.toLocaleString();
                                commitMessage = commitMessage.replace(/\{\{date\}\}/g, dateString);
                                
                                // 逐个删除文件
                                for (const filePath of filesToDelete) {
                                    const fileSha = remoteFileShas.get(filePath);
                                    if (!fileSha) {
                                        console.log(`跳过删除文件 ${filePath}：未找到 SHA 值`);
                                        continue;
                                    }
                                    
                                    const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}`;
                                    
                                    const response = await fetch(apiUrl, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `token ${authToken}`,
                                            'Accept': 'application/vnd.github.v3+json',
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            message: commitMessage,
                                            sha: fileSha,
                                            branch: branch
                                        })
                                    });
                                    
                                    if (response.status === 200) {
                                        console.log(`删除文件 ${filePath} 成功`);
                                    } else {
                                        const errorData = await response.json();
                                        console.error(`删除文件 ${filePath} 失败: ${errorData.message || response.statusText}`);
                                    }
                                }
                                
                                console.log('远程文件删除完成');
                            } catch (error) {
                                console.error('删除远程文件失败:', error);
                            }
                        }
                        
                        // 打印结果
                        console.log('=== 文件对比结果 ===');
                        console.log(`本地文件数量: ${localFiles.size}`);
                        console.log(`远程文件数量: ${remoteFiles.size}`);
                        console.log(`远程存在但本地不存在的文件数量: ${remoteOnlyFiles.length}`);
                        
                        if (remoteOnlyFiles.length > 0) {
                            console.log('远程存在但本地不存在的文件:');
                            for (const file of remoteOnlyFiles) {
                                console.log(`- ${file}`);
                            }
                            
                            // 删除远程文件
                            await deleteRemoteFiles(remoteOnlyFiles);
                        } else {
                            console.log('没有发现远程存在但本地不存在的文件');
                        }
                        
                        showMessage('文件对比完成，请查看控制台输出');
                    } catch (error) {
                        console.error('文件对比失败:', error);
                        showMessage('文件对比失败');
                    }
                }
                
                // 读取文件内容并转换为base64
                async function readFileContent(filePath) {
                    try {
                        // 使用思源的API读取文件内容
                        const blob = await getFileBlob(filePath);
                        if (!blob) {
                            console.error(`无法读取文件: ${filePath}`);
                            return null;
                        }
                        
                        // 检查是否为图片文件
                        const isImageFile = filePath.toLowerCase().endsWith('.png');
                        
                        if (isImageFile) {
                            // 对于图片文件，使用FileReader读取二进制数据
                            return new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    // 从Data URL中提取base64部分
                                    const base64Data = reader.result.split(',')[1];
                                    resolve(base64Data);
                                };
                                reader.onerror = () => {
                                    reject(new Error('读取图片文件失败'));
                                };
                                reader.readAsDataURL(blob);
                            });
                        } else {
                            // 对于文本文件，保持现有的处理方式
                            // 将Blob转换为文本
                            const text = await blob.text();
                            
                            // 将文本转换为base64
                            const base64Content = btoa(unescape(encodeURIComponent(text)));
                            
                            return base64Content;
                        }
                    } catch (error) {
                        console.error(`读取文件 ${filePath} 失败:`, error);
                        return null;
                    }
                }
                
                // 遍历目录下的所有文件
                async function traverseDirectory(dirPath) {
                    try {
                        const files = await readDir(dirPath);
                        
                        if (!files || !Array.isArray(files)) {
                            return;
                        }
                        
                        for (const item of files) {
                            const fullPath = `${dirPath}/${item.name}`;
                            if (item.type === 'dir' || item.isDir) {
                                // 递归遍历子目录
                                await traverseDirectory(fullPath);
                            } else {
                                // 检查文件是否存在于远程仓库
                                // 构建相对于工作空间根目录的路径
                                const relativePath = fullPath.replace(/^\/data\//, '');
                                
                                const checkResult = await checkFileExistsInRemote(
                                    repoInfo.owner,
                                    repoInfo.repo,
                                    branch,
                                    relativePath,
                                    authToken
                                );
                                
                                // 读取文件内容
                                const fileContent = await readFileContent(fullPath);
                                if (!fileContent) {
                                    console.log(`跳过上传文件 ${relativePath}：无法读取内容`);
                                    continue;
                                }
                                
                                // 上传文件到远程仓库
                                const uploadResult = await uploadFileToRemote(
                                    repoInfo.owner,
                                    repoInfo.repo,
                                    branch,
                                    relativePath,
                                    fileContent,
                                    authToken,
                                    checkResult.sha
                                );
                                
                                if (uploadResult) {
                                    console.log(`上传文件 ${relativePath} 成功`);
                                } else {
                                    console.log(`上传文件 ${relativePath} 失败`);
                                }
                            }
                        }
                    } catch (error) {
                        // 静默处理错误，不输出到控制台
                    }
                }
                
                // 处理每个目录
                for (const dir of dirs) {
                    // 处理目录路径，添加 /data/ 前缀并处理斜杠
                    let processedDir = dir;
                    // 移除首尾空格
                    processedDir = processedDir.trim();
                    // 移除首尾斜杠
                    processedDir = processedDir.replace(/^\/|\/$/g, '');
                    // 替换连续的斜杠为单个斜杠
                    processedDir = processedDir.replace(/\/+\//g, '/');
                    // 添加 /data/ 前缀
                    processedDir = `/data/${processedDir}`;
                    // 确保不以斜杠结尾
                    processedDir = processedDir.replace(/\/$/, '');
                    
                    // 使用封装好的 readDir 函数获取目录信息
                    const result = await readDir(processedDir);
                    
                    // 显示获取到的文件夹名称
                    if (result && Array.isArray(result)) {
                        const folders = result.filter(item => item.type === 'dir');
                        const folderNames = folders.map(folder => folder.name);
                        console.log(`${processedDir} 目录下的文件夹: ${folderNames.join(', ')}`);
                    } else {
                        const folderName = processedDir.split(/[\\/]/).pop();
                        console.log(`${processedDir} 目录名称: ${folderName}`);
                    }
                    
                    // 开始遍历目录下的所有文件，检查是否存在于远程仓库
                    console.log(`开始检查远程仓库中是否存在 ${processedDir} 目录下的文件...`);
                    await traverseDirectory(processedDir);
                }
                
                // 遍历 /data/assets 目录
                console.log('开始检查 /data/assets 目录下的文件...');
                await traverseDirectory('/data/assets');
                
                console.log('文件检查完成');
                showMessage('文件检查完成，请查看控制台输出');
                
                // 执行文件对比
                console.log('开始执行文件对比...');
                await performFileComparison();
                
                return true;
            } catch (error) {
                // 静默处理错误，不输出到控制台
                
                // 如果 API 调用失败，尝试从路径中提取文件夹名称作为 fallback
                try {
                    // 处理工作空间目录，添加 /data/ 前缀并处理斜杠
                    let processedWorkspaceDir = workspaceDir;
                    // 移除首尾空格
                    processedWorkspaceDir = processedWorkspaceDir.trim();
                    // 移除首尾斜杠
                    processedWorkspaceDir = processedWorkspaceDir.replace(/^\/|\/$/g, '');
                    // 替换连续的斜杠为单个斜杠
                    processedWorkspaceDir = processedWorkspaceDir.replace(/\/+\//g, '/');
                    // 添加 /data/ 前缀
                    processedWorkspaceDir = `/data/${processedWorkspaceDir}`;
                    // 确保不以斜杠结尾
                    processedWorkspaceDir = processedWorkspaceDir.replace(/\/$/, '');
                    
                    const folderName = processedWorkspaceDir.split(/[\\/]/).pop();
                    showMessage(`工作空间文件夹名称: ${folderName}`);
                } catch (fallbackError) {
                    showMessage('获取工作空间目录信息失败');
                }
                
                return false;
            }
        }
        
        // 同步模式切换事件
        setTimeout(() => {
            const syncModeSelect = dialog.element.querySelector('#syncMode') as HTMLSelectElement;
            if (syncModeSelect) {
                syncModeSelect.addEventListener('change', function() {
                    const selectedMode = this.value;
                    if (selectedMode === 'auto') {
                        // 显示确认框
                        const confirmResult = confirm('自动同步模式提醒\n\n为避免笔记内容被覆盖、丢失或冲突，建议只在单台电脑上启用自动同步。\n\n如果您在家用电脑和工作电脑上都开启了自动同步，可能会导致同步冲突和数据丢失。\n\n确认您了解此风险并只在此台电脑上使用自动同步模式吗？');
                        
                        if (confirmResult) {
                            // 用户确认，执行更新
                            updateSyncModeUI();
                        } else {
                            // 用户取消，改回手动同步
                            this.value = 'manual';
                            updateSyncModeUI();
                        }
                    } else {
                        // 切换到手动同步，直接执行更新
                        updateSyncModeUI();
                    }
                });
            }
            
            // 手动同步按钮点击事件
            const manualSyncBtn = dialog.element.querySelector('#manualSyncBtn') as HTMLButtonElement;
            if (manualSyncBtn) {
                manualSyncBtn.addEventListener('click', async () => {
                    console.log('执行手动同步...');
                    
                    // 获取笔记目录
                    const notesDir = (dialog.element.querySelector('#workspaceDir') as HTMLInputElement).value.trim();
                    
                    if (!notesDir) {
                        showMessage('请先填写笔记目录');
                        return;
                    }
                    
                    try {
                        // 分割多个目录（用英文逗号分隔）
                        const dirs = notesDir.split(',').map(dir => dir.trim()).filter(dir => dir !== '');
                        
                        // 从输入框获取仓库地址
                        const repositoryUrl = (dialog.element.querySelector('#repositoryUrl') as HTMLInputElement).value.trim();
                        if (!repositoryUrl) {
                            showMessage('请先填写 GitHub 仓库地址');
                            return;
                        }
                        
                        // 从仓库地址中提取 owner 和 repo
                        function extractOwnerAndRepo(url) {
                            // 匹配 HTTPS 格式：https://github.com/owner/repo.git
                            const match = url.match(/https:\/\/github\.com\/(.*?)\/(.*?)\.git$/);
                            if (match) {
                                return {
                                    owner: match[1],
                                    repo: match[2]
                                };
                            }
                            return null;
                        }
                        
                        const repoInfo = extractOwnerAndRepo(repositoryUrl);
                        if (!repoInfo) {
                            showMessage('GitHub 仓库地址格式不正确');
                            return;
                        }
                        
                        // 从输入框获取分支名称
                        const branch = (dialog.element.querySelector('#branch') as HTMLInputElement).value.trim() || 'main';
                        
                        // 从输入框获取认证 token
                        const authToken = (dialog.element.querySelector('#authToken') as HTMLInputElement).value.trim();
                        if (!authToken) {
                            showMessage('请先填写 Personal Access Token');
                            return;
                        }
                        
                        // 检查单个文件是否存在于远程仓库
                        async function checkFileExistsInRemote(owner, repo, branch, filePath, token) {
                            try {
                                const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
                                const response = await fetch(apiUrl, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `token ${token}`,
                                        'Accept': 'application/vnd.github.v3+json'
                                    }
                                });
                                
                                if (response.status === 200) {
                                    const data = await response.json();
                                    return {
                                        exists: true,
                                        sha: data.sha
                                    };
                                } else if (response.status === 404) {
                                    return {
                                        exists: false,
                                        sha: null
                                    };
                                } else {
                                    throw new Error(`API 请求失败: ${response.statusText}`);
                                }
                            } catch (error) {
                                console.error(`检查文件 ${filePath} 失败:`, error);
                                return {
                                    exists: false,
                                    sha: null
                                };
                            }
                        }
                        
                        // 上传文件到远程仓库
                        async function uploadFileToRemote(owner, repo, branch, filePath, content, token, sha = null) {
                            try {
                                const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
                                
                                // 从配置中获取 commit 模板
                                const commitTemplate = (dialog.element.querySelector('#commitTemplate') as HTMLInputElement).value.trim() || "同步笔记更新：{{date}}";
                                // 处理 commit 信息中的 {{date}} 占位符
                                let commitMessage = commitTemplate;
                                const now = new Date();
                                const dateString = now.toLocaleString();
                                commitMessage = commitMessage.replace(/\{\{date\}\}/g, dateString);
                                
                                const payload = {
                                    message: commitMessage,
                                    content: content,
                                    branch: branch
                                };
                                
                                // 如果文件存在，添加 sha 参数
                                if (sha) {
                                    payload.sha = sha;
                                }
                                
                                const response = await fetch(apiUrl, {
                                    method: 'PUT',
                                    headers: {
                                        'Authorization': `token ${token}`,
                                        'Accept': 'application/vnd.github.v3+json',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(payload)
                                });
                                
                                if (response.status === 201 || response.status === 200) {
                                    return true;
                                } else {
                                    const errorData = await response.json();
                                    throw new Error(`上传文件失败: ${errorData.message || response.statusText}`);
                                }
                            } catch (error) {
                                console.error(`上传文件 ${filePath} 失败:`, error);
                                return false;
                            }
                        }
                        
                        // 执行文件对比
                        async function performFileComparison() {
                            try {
                                // 收集本地文件路径
                                const localFiles = new Set();
                                
                                // 遍历目录下的所有文件
                                async function collectLocalFiles(dirPath) {
                                    try {
                                        const files = await readDir(dirPath);
                                        
                                        if (!files || !Array.isArray(files)) {
                                            return;
                                        }
                                        
                                        for (const item of files) {
                                            const fullPath = `${dirPath}/${item.name}`;
                                            if (item.type === 'dir' || item.isDir) {
                                                // 递归遍历子目录
                                                await collectLocalFiles(fullPath);
                                            } else {
                                                // 构建相对于工作空间根目录的路径
                                                const relativePath = fullPath.replace(/^\/data\//, '');
                                                localFiles.add(relativePath);
                                            }
                                        }
                                    } catch (error) {
                                        // 静默处理错误，不输出到控制台
                                    }
                                }
                                
                                // 收集远程文件路径和SHA值
                                const remoteFiles = new Set();
                                const remoteFileShas = new Map(); // 存储文件路径到SHA值的映射
                                
                                // 使用 Git Trees API 一次性获取整个仓库的文件树
                                async function collectRemoteFiles() {
                                    try {
                                        // 首先获取默认分支的最新提交
                                        const commitApiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits/${branch}`;
                                        const commitResponse = await fetch(commitApiUrl, {
                                            method: 'GET',
                                            headers: {
                                                'Authorization': `token ${authToken}`,
                                                'Accept': 'application/vnd.github.v3+json'
                                            }
                                        });
                                        
                                        if (!commitResponse.ok) {
                                            throw new Error(`获取最新提交失败: ${commitResponse.statusText}`);
                                        }
                                        
                                        const commitData = await commitResponse.json();
                                        const treeSha = commitData.sha;
                                        
                                        // 使用 Git Trees API 获取文件树
                                        const treeApiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${treeSha}?recursive=1`;
                                        const treeResponse = await fetch(treeApiUrl, {
                                            method: 'GET',
                                            headers: {
                                                'Authorization': `token ${authToken}`,
                                                'Accept': 'application/vnd.github.v3+json'
                                            }
                                        });
                                        
                                        if (!treeResponse.ok) {
                                            throw new Error(`获取文件树失败: ${treeResponse.statusText}`);
                                        }
                                        
                                        const treeData = await treeResponse.json();
                                        
                                        if (treeData.tree && Array.isArray(treeData.tree)) {
                                            for (const item of treeData.tree) {
                                                if (item.type === 'blob') {
                                                    remoteFiles.add(item.path);
                                                    remoteFileShas.set(item.path, item.sha);
                                                }
                                            }
                                        }
                                    } catch (error) {
                                        console.error(`获取远程文件列表失败:`, error);
                                    }
                                }
                                
                                // 收集本地文件
                                for (const dir of dirs) {
                                    // 处理目录路径，添加 /data/ 前缀并处理斜杠
                                    let processedDir = dir;
                                    // 移除首尾空格
                                    processedDir = processedDir.trim();
                                    // 移除首尾斜杠
                                    processedDir = processedDir.replace(/^\/|\/$/g, '');
                                    // 替换连续的斜杠为单个斜杠
                                    processedDir = processedDir.replace(/\/+/g, '/');
                                    // 添加 /data/ 前缀
                                    processedDir = `/data/${processedDir}`;
                                    // 确保不以斜杠结尾
                                    processedDir = processedDir.replace(/\/$/, '');
                                    
                                    // 收集本地文件
                                    await collectLocalFiles(processedDir);
                                }
                                
                                // 收集 /data/assets 目录下的文件
                                await collectLocalFiles('/data/assets');
                                
                                // 收集远程文件
                                await collectRemoteFiles();
                                
                                // 找出远程存在但本地不存在的文件
                                const remoteOnlyFiles = [];
                                for (const file of remoteFiles) {
                                    if (!localFiles.has(file)) {
                                        remoteOnlyFiles.push(file);
                                    }
                                }
                                
                                // 删除远程仓库中存在但本地不存在的文件
                                async function deleteRemoteFiles(filesToDelete) {
                                    try {
                                        if (filesToDelete.length === 0) {
                                            console.log('没有需要删除的远程文件');
                                            return;
                                        }
                                        
                                        console.log('开始删除远程文件...');
                                        
                                        // 从配置中获取 commit 模板
                                        const commitTemplate = (dialog.element.querySelector('#commitTemplate') as HTMLInputElement).value.trim() || "同步笔记更新：{{date}}";
                                        // 处理 commit 信息中的 {{date}} 占位符
                                        let commitMessage = commitTemplate;
                                        const now = new Date();
                                        const dateString = now.toLocaleString();
                                        commitMessage = commitMessage.replace(/\{\{date\}\}/g, dateString);
                                        
                                        // 逐个删除文件
                                        for (const filePath of filesToDelete) {
                                            const fileSha = remoteFileShas.get(filePath);
                                            if (!fileSha) {
                                                console.log(`跳过删除文件 ${filePath}：未找到 SHA 值`);
                                                continue;
                                            }
                                            
                                            const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}`;
                                            
                                            const response = await fetch(apiUrl, {
                                                method: 'DELETE',
                                                headers: {
                                                    'Authorization': `token ${authToken}`,
                                                    'Accept': 'application/vnd.github.v3+json',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    message: commitMessage,
                                                    sha: fileSha,
                                                    branch: branch
                                                })
                                            });
                                            
                                            if (response.status === 200) {
                                                console.log(`删除文件 ${filePath} 成功`);
                                            } else {
                                                const errorData = await response.json();
                                                console.error(`删除文件 ${filePath} 失败: ${errorData.message || response.statusText}`);
                                            }
                                        }
                                        
                                        console.log('远程文件删除完成');
                                    } catch (error) {
                                        console.error('删除远程文件失败:', error);
                                    }
                                }
                                
                                // 打印结果
                                console.log('=== 文件对比结果 ===');
                                console.log(`本地文件数量: ${localFiles.size}`);
                                console.log(`远程文件数量: ${remoteFiles.size}`);
                                console.log(`远程存在但本地不存在的文件数量: ${remoteOnlyFiles.length}`);
                                
                                if (remoteOnlyFiles.length > 0) {
                                    console.log('远程存在但本地不存在的文件:');
                                    for (const file of remoteOnlyFiles) {
                                        console.log(`- ${file}`);
                                    }
                                    
                                    // 删除远程文件
                                    await deleteRemoteFiles(remoteOnlyFiles);
                                } else {
                                    console.log('没有发现远程存在但本地不存在的文件');
                                }
                                
                                showMessage('文件对比完成，请查看控制台输出');
                            } catch (error) {
                                console.error('文件对比失败:', error);
                                showMessage('文件对比失败');
                            }
                        }
                        
                        // 读取文件内容并转换为base64
                        async function readFileContent(filePath) {
                            try {
                                // 使用思源的API读取文件内容
                                const blob = await getFileBlob(filePath);
                                if (!blob) {
                                    console.error(`无法读取文件: ${filePath}`);
                                    return null;
                                }
                                
                                // 检查是否为图片文件
                                const isImageFile = filePath.toLowerCase().endsWith('.png');
                                
                                if (isImageFile) {
                                    // 对于图片文件，使用FileReader读取二进制数据
                                    return new Promise((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            // 从Data URL中提取base64部分
                                            const base64Data = reader.result.split(',')[1];
                                            resolve(base64Data);
                                        };
                                        reader.onerror = () => {
                                            reject(new Error('读取图片文件失败'));
                                        };
                                        reader.readAsDataURL(blob);
                                    });
                                } else {
                                    // 对于文本文件，保持现有的处理方式
                                    // 将Blob转换为文本
                                    const text = await blob.text();
                                    
                                    // 将文本转换为base64
                                    const base64Content = btoa(unescape(encodeURIComponent(text)));
                                    
                                    return base64Content;
                                }
                            } catch (error) {
                                console.error(`读取文件 ${filePath} 失败:`, error);
                                return null;
                            }
                        }
                        
                        // 遍历目录下的所有文件
                        async function traverseDirectory(dirPath) {
                            try {
                                const files = await readDir(dirPath);
                                
                                if (!files || !Array.isArray(files)) {
                                    return;
                                }
                                
                                for (const item of files) {
                                    const fullPath = `${dirPath}/${item.name}`;
                                    if (item.type === 'dir' || item.isDir) {
                                        // 递归遍历子目录
                                        await traverseDirectory(fullPath);
                                    } else {
                                        // 检查文件是否存在于远程仓库
                                        // 构建相对于工作空间根目录的路径
                                        const relativePath = fullPath.replace(/^\/data\//, '');
                                        
                                        const checkResult = await checkFileExistsInRemote(
                                            repoInfo.owner,
                                            repoInfo.repo,
                                            branch,
                                            relativePath,
                                            authToken
                                        );
                                        
                                        // 读取文件内容
                                        const fileContent = await readFileContent(fullPath);
                                        if (!fileContent) {
                                            console.log(`跳过上传文件 ${relativePath}：无法读取内容`);
                                            continue;
                                        }
                                        
                                        // 上传文件到远程仓库
                                        const uploadResult = await uploadFileToRemote(
                                            repoInfo.owner,
                                            repoInfo.repo,
                                            branch,
                                            relativePath,
                                            fileContent,
                                            authToken,
                                            checkResult.sha
                                        );
                                        
                                        if (uploadResult) {
                                            console.log(`上传文件 ${relativePath} 成功`);
                                        } else {
                                            console.log(`上传文件 ${relativePath} 失败`);
                                        }
                                    }
                                }
                            } catch (error) {
                                // 静默处理错误，不输出到控制台
                            }
                        }
                        
                        // 处理每个目录
                        for (const dir of dirs) {
                            // 处理目录路径，添加 /data/ 前缀并处理斜杠
                            let processedDir = dir;
                            // 移除首尾空格
                            processedDir = processedDir.trim();
                            // 移除首尾斜杠
                            processedDir = processedDir.replace(/^\/|\/$/g, '');
                            // 替换连续的斜杠为单个斜杠
                            processedDir = processedDir.replace(/\/+/g, '/');
                            // 添加 /data/ 前缀
                            processedDir = `/data/${processedDir}`;
                            // 确保不以斜杠结尾
                            processedDir = processedDir.replace(/\/$/, '');
                            
                            // 使用封装好的 readDir 函数获取目录信息
                            const result = await readDir(processedDir);
                            
                            // 显示获取到的文件夹名称
                            if (result && Array.isArray(result)) {
                                const folders = result.filter(item => item.type === 'dir');
                                const folderNames = folders.map(folder => folder.name);
                                console.log(`${processedDir} 目录下的文件夹: ${folderNames.join(', ')}`);
                            } else {
                                const folderName = processedDir.split(/[\\/]/).pop();
                                console.log(`${processedDir} 目录名称: ${folderName}`);
                            }
                            
                            // 开始遍历目录下的所有文件，检查是否存在于远程仓库
                            console.log(`开始检查远程仓库中是否存在 ${processedDir} 目录下的文件...`);
                            await traverseDirectory(processedDir);
                        }
                        
                        // 遍历 /data/assets 目录
                        console.log('开始检查 /data/assets 目录下的文件...');
                        await traverseDirectory('/data/assets');
                        
                        console.log('文件检查完成');
                        showMessage('文件检查完成，请查看控制台输出');
                        
                        // 执行文件对比
                        console.log('开始执行文件对比...');
                        await performFileComparison();
                    } catch (error) {
                        // 静默处理错误，不输出到控制台
                        
                        // 如果 API 调用失败，尝试从路径中提取文件夹名称作为 fallback
                        try {
                            // 处理工作空间目录，添加 /data/ 前缀并处理斜杠
                            let processedWorkspaceDir = workspaceDir;
                            // 移除首尾空格
                            processedWorkspaceDir = processedWorkspaceDir.trim();
                            // 移除首尾斜杠
                            processedWorkspaceDir = processedWorkspaceDir.replace(/^\/|\/$/g, '');
                            // 替换连续的斜杠为单个斜杠
                            processedWorkspaceDir = processedWorkspaceDir.replace(/\/+/g, '/');
                            // 添加 /data/ 前缀
                            processedWorkspaceDir = `/data/${processedWorkspaceDir}`;
                            // 确保不以斜杠结尾
                            processedWorkspaceDir = processedWorkspaceDir.replace(/\/$/, '');
                            
                            const folderName = processedWorkspaceDir.split(/[\\/]/).pop();
                            showMessage(`工作空间文件夹名称: ${folderName}`);
                        } catch (fallbackError) {
                            showMessage('获取工作空间目录信息失败');
                        }
                    }
                });
            }
            
            // 覆盖本地按钮点击事件
            const overrideLocalBtn = dialog.element.querySelector('#overrideLocalBtn') as HTMLButtonElement;
            if (overrideLocalBtn) {
                overrideLocalBtn.addEventListener('click', async () => {
                    // 显示确认框
                    const confirmResult = confirm('警告：覆盖本地操作会将本地文件完全替换为仓库中的版本，所有本地修改将会丢失。\n\n此操作不可逆，请确保您已备份重要数据。\n\n是否继续执行覆盖操作？');
                    
                    // 如果用户取消，直接返回
                    if (!confirmResult) {
                        return;
                    }
                    
                    console.log('执行覆盖本地...');
                    
                    // 获取笔记目录
                    const notesDir = (dialog.element.querySelector('#workspaceDir') as HTMLInputElement).value.trim();
                    
                    if (!notesDir) {
                        showMessage('请先填写笔记目录');
                        return;
                    }
                    
                    try {
                        // 分割多个目录（用英文逗号分隔）
                        const dirs = notesDir.split(',').map(dir => dir.trim()).filter(dir => dir !== '');
                        
                        // 从输入框获取仓库地址
                        const repositoryUrl = (dialog.element.querySelector('#repositoryUrl') as HTMLInputElement).value.trim();
                        if (!repositoryUrl) {
                            showMessage('请先填写 GitHub 仓库地址');
                            return;
                        }
                        
                        // 从仓库地址中提取 owner 和 repo
                        function extractOwnerAndRepo(url) {
                            // 匹配 HTTPS 格式：https://github.com/owner/repo.git
                            const match = url.match(/https:\/\/github\.com\/(.*?)\/(.*?)\.git$/);
                            if (match) {
                                return {
                                    owner: match[1],
                                    repo: match[2]
                                };
                            }
                            return null;
                        }
                        
                        const repoInfo = extractOwnerAndRepo(repositoryUrl);
                        if (!repoInfo) {
                            showMessage('GitHub 仓库地址格式不正确');
                            return;
                        }
                        
                        // 从输入框获取分支名称
                        const branch = (dialog.element.querySelector('#branch') as HTMLInputElement).value.trim() || 'main';
                        
                        // 从输入框获取认证 token
                        const authToken = (dialog.element.querySelector('#authToken') as HTMLInputElement).value.trim();
                        if (!authToken) {
                            showMessage('请先填写 Personal Access Token');
                            return;
                        }
                        
                        // 下载远程文件
                        async function downloadRemoteFile(filePath, fileSha) {
                            try {
                                const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}?ref=${branch}`;
                                const response = await fetch(apiUrl, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `token ${authToken}`,
                                        'Accept': 'application/vnd.github.v3+json'
                                    }
                                });
                                
                                if (!response.ok) {
                                    throw new Error(`下载文件失败: ${response.statusText}`);
                                }
                                
                                const data = await response.json();
                                if (!data.content) {
                                    throw new Error('文件内容为空');
                                }
                                
                                // 解码 base64 内容并正确处理 UTF-8 编码
                                const binaryString = atob(data.content.replace(/\s/g, ''));
                                const len = binaryString.length;
                                const bytes = new Uint8Array(len);
                                for (let i = 0; i < len; i++) {
                                    bytes[i] = binaryString.charCodeAt(i);
                                }
                                const content = new TextDecoder('utf-8').decode(bytes);
                                return content;
                            } catch (error) {
                                console.error(`下载文件 ${filePath} 失败:`, error);
                                return null;
                            }
                        }
                        
                        // 写入文件到本地
                        async function writeLocalFile(filePath, content) {
                            try {
                                // 构建本地文件路径
                                const localFilePath = `/data/${filePath}`;
                                
                                // 确保目录存在
                                const dirPath = localFilePath.substring(0, localFilePath.lastIndexOf('/'));
                                
                                // 检查目录是否存在
                                try {
                                    await readDir(dirPath);
                                } catch (error) {
                                    // 目录不存在，需要创建
                                    console.log(`创建目录: ${dirPath}`);
                                    // 创建目录结构
                                    await createDirectory(dirPath);
                                }
                                
                                // 将字符串内容转换为Blob对象
                                const blob = new Blob([content], { type: 'text/plain' });
                                
                                // 使用思源的API写入文件
                                console.log(`写入文件: ${localFilePath}`);
                                
                                // 暂时打印文件内容长度
                                console.log(`文件内容长度: ${content.length}`);
                                
                                // 使用putFile函数写入文件
                                await putFile(localFilePath, false, blob);
                                
                                return true;
                            } catch (error) {
                                console.error(`写入文件 ${filePath} 失败:`, error);
                                return false;
                            }
                        }
                        
                        // 创建目录结构
                        async function createDirectory(dirPath) {
                            try {
                                // 分割目录路径
                                const dirs = dirPath.split('/').filter(dir => dir !== '');
                                let currentPath = '';
                                
                                // 逐个创建目录
                                for (const dir of dirs) {
                                    currentPath += `/${dir}`;
                                    try {
                                        // 检查目录是否存在
                                        await readDir(currentPath);
                                    } catch (error) {
                                        // 目录不存在，创建它
                                        console.log(`创建目录: ${currentPath}`);
                                        // 使用putFile函数创建目录
                                        await putFile(currentPath, true, null);
                                    }
                                }
                            } catch (error) {
                                console.error(`创建目录 ${dirPath} 失败:`, error);
                                throw error;
                            }
                        }
                        
                        // 收集远程文件路径和SHA值
                        const remoteFiles = new Set();
                        const remoteFileShas = new Map(); // 存储文件路径到SHA值的映射
                        
                        // 使用 Git Trees API 一次性获取整个仓库的文件树
                        async function collectRemoteFiles() {
                            try {
                                // 首先获取默认分支的最新提交
                                const commitApiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits/${branch}`;
                                const commitResponse = await fetch(commitApiUrl, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `token ${authToken}`,
                                        'Accept': 'application/vnd.github.v3+json'
                                    }
                                });
                                
                                if (!commitResponse.ok) {
                                    throw new Error(`获取最新提交失败: ${commitResponse.statusText}`);
                                }
                                
                                const commitData = await commitResponse.json();
                                const treeSha = commitData.sha;
                                
                                // 使用 Git Trees API 获取文件树
                                const treeApiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${treeSha}?recursive=1`;
                                const treeResponse = await fetch(treeApiUrl, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `token ${authToken}`,
                                        'Accept': 'application/vnd.github.v3+json'
                                    }
                                });
                                
                                if (!treeResponse.ok) {
                                    throw new Error(`获取文件树失败: ${treeResponse.statusText}`);
                                }
                                
                                const treeData = await treeResponse.json();
                                
                                if (treeData.tree && Array.isArray(treeData.tree)) {
                                    for (const item of treeData.tree) {
                                        if (item.type === 'blob') {
                                            remoteFiles.add(item.path);
                                            remoteFileShas.set(item.path, item.sha);
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error(`获取远程文件列表失败:`, error);
                            }
                        }
                        
                        // 收集远程文件
                        await collectRemoteFiles();
                        
                        // 下载并覆盖本地文件
                        console.log('开始下载并覆盖本地文件...');
                        
                        let downloadedCount = 0;
                        let failedCount = 0;
                        
                        for (const filePath of remoteFiles) {
                            console.log(`处理文件: ${filePath}`);
                            
                            // 下载远程文件
                            const content = await downloadRemoteFile(filePath, remoteFileShas.get(filePath));
                            if (!content) {
                                console.error(`下载文件 ${filePath} 失败`);
                                failedCount++;
                                continue;
                            }
                            
                            // 写入本地文件
                            const writeResult = await writeLocalFile(filePath, content);
                            if (writeResult) {
                                console.log(`写入文件 ${filePath} 成功`);
                                downloadedCount++;
                            } else {
                                console.error(`写入文件 ${filePath} 失败`);
                                failedCount++;
                            }
                        }
                        
                        console.log(`文件覆盖完成：成功 ${downloadedCount} 个，失败 ${failedCount} 个`);
                        showMessage(`文件覆盖完成：成功 ${downloadedCount} 个，失败 ${failedCount} 个`);
                    } catch (error) {
                        console.error('覆盖本地失败:', error);
                        showMessage('覆盖本地失败');
                    }
                });
            }
            

        }, 100);
        
        // 更新同步模式 UI
        function updateSyncModeUI() {
            const syncMode = (dialog.element.querySelector('#syncMode') as HTMLSelectElement).value;
            const autoSyncSection = dialog.element.querySelector('#autoSyncSection') as HTMLElement;
            const manualSyncBtn = dialog.element.querySelector('#manualSyncBtn') as HTMLElement;
            const overrideLocalBtn = dialog.element.querySelector('#overrideLocalBtn') as HTMLElement;
            const syncIntervalInput = dialog.element.querySelector('#syncInterval') as HTMLInputElement;
            
            if (syncMode === 'auto') {
                // 显示自动同步设置，隐藏手动同步和覆盖本地按钮
                autoSyncSection.style.display = 'block';
                manualSyncBtn.style.display = 'none';
                overrideLocalBtn.style.display = 'none';
            } else if (syncMode === 'manual') {
                // 隐藏自动同步设置，显示手动同步和覆盖本地按钮
                autoSyncSection.style.display = 'none';
                manualSyncBtn.style.display = 'inline-block';
                overrideLocalBtn.style.display = 'inline-block';
                // 清空自动同步间隔输入框
                if (syncIntervalInput) {
                    syncIntervalInput.value = '';
                }
            }
        }
        
        // 添加保存按钮点击事件
        setTimeout(() => {
            const saveButton = dialog.element.querySelector('#saveConfig');
            if (saveButton) {
                saveButton.addEventListener('click', async () => {
                    // 表单验证
                    const repositoryUrl = (dialog.element.querySelector('#repositoryUrl') as HTMLInputElement).value.trim();
                    const branch = (dialog.element.querySelector('#branch') as HTMLInputElement).value.trim();
                    const authToken = (dialog.element.querySelector('#authToken') as HTMLInputElement).value.trim();
                    const commitTemplate = (dialog.element.querySelector('#commitTemplate') as HTMLInputElement).value.trim();
                    const workspaceDir = (dialog.element.querySelector('#workspaceDir') as HTMLInputElement).value.trim();
                    
                    // 检查必填字段
                    const missingFields = [];
                    if (!repositoryUrl) missingFields.push('GitHub 仓库地址');
                    if (!branch) missingFields.push('分支名称');
                    if (!authToken) missingFields.push('Personal Access Token');
                    if (!commitTemplate) missingFields.push('默认 Commit 信息模板');
                    if (!workspaceDir) missingFields.push('工作空间目录');
                    
                    // 获取同步模式和同步间隔
                    const syncMode = (dialog.element.querySelector('#syncMode') as HTMLSelectElement).value;
                    const syncIntervalInput = (dialog.element.querySelector('#syncInterval') as HTMLInputElement).value;
                    
                    // 当选择自动同步模式时，验证同步间隔
                    if (syncMode === 'auto') {
                        const syncInterval = parseInt(syncIntervalInput);
                        if (!syncIntervalInput || isNaN(syncInterval) || syncInterval <= 0) {
                            showMessage('自动同步模式下，同步间隔必须为大于0的整数，最小值为1');
                            return;
                        }
                    }
                    
                    // 如果有必填字段未填写，显示提示信息
                    if (missingFields.length > 0) {
                        showMessage(`请填写以下必填字段：${missingFields.join('、')}`);
                        return;
                    }
                    
                    // 处理工作空间目录，添加 /data/ 前缀并处理斜杠
                    let processedWorkspaceDir = workspaceDir;
                    // 移除首尾空格
                    processedWorkspaceDir = processedWorkspaceDir.trim();
                    // 移除首尾斜杠
                    processedWorkspaceDir = processedWorkspaceDir.replace(/^\/|\/$/g, '');
                    // 替换连续的斜杠为单个斜杠
                    processedWorkspaceDir = processedWorkspaceDir.replace(/\/+/g, '/');
                    // 添加 /data/ 前缀
                    processedWorkspaceDir = `/data/${processedWorkspaceDir}`;
                    // 确保不以斜杠结尾
                    processedWorkspaceDir = processedWorkspaceDir.replace(/\/$/, '');
                    
                    // 始终使用包含 {{date}} 占位符的版本，确保不保存具体时间
                    const templateWithPlaceholder = commitTemplate || "同步笔记更新：{{date}}";
                    
                    // 处理 commitTemplate 中的 {{date}} 占位符，仅用于控制台输出
                    let processedCommitTemplate = templateWithPlaceholder;
                    const now = new Date();
                    const dateString = now.toLocaleString(); // 生成当前时间字符串
                    processedCommitTemplate = processedCommitTemplate.replace(/\{\{date\}\}/g, dateString); // 替换 {{date}} 占位符
                    
                    const config = {
                        gitConf: {
                            repositoryUrl: repositoryUrl,
                            branch: branch,
                            authToken: authToken,
                            commitTemplate: templateWithPlaceholder, // 保存包含占位符的模板
                            workspaceDir: processedWorkspaceDir,
                            syncMode: (dialog.element.querySelector('#syncMode') as HTMLSelectElement).value,
                            syncInterval: parseInt((dialog.element.querySelector('#syncInterval') as HTMLInputElement).value) || 0
                        }
                    };
                    
                    // 控制台输出时显示替换后的模板
                    const configForLog = {...config};
                    configForLog.gitConf.commitTemplate = processedCommitTemplate;
                    console.log('Git 同步配置:', configForLog);
                    
                    // 保存配置到插件的数据对象
                    plugin.data.gitSyncConfig = config;
                    // 持久化保存数据
                    await plugin.saveData('gitSyncConfig', config);
                    
                    // 显示保存成功提示
                    showMessage('配置保存成功！');
                    
                    // 如果是自动同步模式，执行一次同步并设置定时器
                    if (syncMode === 'auto') {
                        console.log('自动同步模式：执行首次同步...');
                        // 执行同步
                        const syncSuccess = await performSync();
                        if (syncSuccess) {
                            showMessage('同步完成！');
                        }
                        
                        // 设置自动同步定时器
                        const syncInterval = parseInt(syncIntervalInput) * 60 * 1000; // 转换为毫秒
                        console.log(`设置自动同步定时器：每 ${parseInt(syncIntervalInput)} 分钟同步一次`);
                        
                        // 清除可能存在的旧定时器
                        if (window.autoSyncTimer) {
                            clearInterval(window.autoSyncTimer);
                        }
                        
                        // 设置新定时器
                        window.autoSyncTimer = setInterval(async () => {
                            console.log('自动同步：执行定时同步...');
                            await performSync();
                        }, syncInterval);
                    } else {
                        // 手动同步模式，清除定时器
                        if (window.autoSyncTimer) {
                            clearInterval(window.autoSyncTimer);
                            window.autoSyncTimer = null;
                            console.log('手动同步模式：清除自动同步定时器');
                        }
                    }
                    
                    // 关闭弹窗
                    // dialog.destroy();
                });
            }
            
            // 添加取消按钮点击事件
            const cancelButton = dialog.element.querySelector('#cancelConfig');
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    dialog.destroy();
                });
            }
        }, 100);
    }
}
